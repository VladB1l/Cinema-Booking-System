const express = require('express');
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const router = express.Router();
const sharp = require('sharp');
const multer = require('multer');
const {
    getCollectionModel,
    createDocument,
    updateDocument,
    deleteDocument,
    Ticket,
    Movie,
} = require('../services/mongoService');
const { sendMessage } = require('../services/rabbitmqService');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { v4: uuidv4 } = require('uuid');

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const s3 = new S3Client({
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    },
    region: 'eu-north-1'
});


router.get('/:collection', async (req, res) => {
    const { collection } = req.params;

    try {
        const Model = getCollectionModel(collection);

        if (collection === 'tickets') {
            const ticketsWithMovieInfo = await Model.aggregate([
                {
                    $lookup: {
                        from: 'movies',
                        localField: 'movie_id',
                        foreignField: '_id',
                        as: 'movie_info'
                    }
                },
                {
                    $unwind: {
                        path: '$movie_info',
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]);

            res.json(ticketsWithMovieInfo);
        } else {
            const data = await Model.find({});
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: `Error fetching data: ${error.message}` });
    }
});


router.post('/tickets', async (req, res) => {
    const { movie_id, show_date, show_time, seat_number } = req.body;

    if (!movie_id || !show_date || !show_time || !seat_number) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const movie = await Movie.findById(movie_id);
        if (!movie) {
            return res.status(404).send('Movie not found.');
        }

        const newTicket = new Ticket({
            movie_id,
            show_date,
            show_time,
            seat_number,
            movie_info: {
                _id: movie._id,
                title: movie.title,
                poster_url: movie.poster_url
            }
        });

        await newTicket.save();
        sendMessage({ action: 'create_ticket_NOSQL', data: newTicket });

        res.status(201).json({ message: 'New ticket created', ticket: newTicket });
    } catch (error) {
        res.status(500).json({ error: `Error creating ticket: ${error.message}` });
    }
});


router.put('/update-movie-poster', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const file = req.file;
    const fileName = `${uuidv4()}-${file.originalname}`;
    const movieTitle = req.body.movieTitle;
    const imageUrl = `https://docker-lab5.s3.eu-north-1.amazonaws.com/${fileName}`;

    console.log(fileName)
    console.log(movieTitle)


    try {
        let fileBuffer;
        if (file.mimetype === 'image/gif') {
            fileBuffer = file.buffer;
        } else {
            fileBuffer = await sharp(file.buffer)
                .resize({
                    height: 1250,
                    width: 1250,
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 1 }
                })
                .toBuffer();
        }

        const params = {
            Bucket: 'docker-lab5',
            Key: fileName,
            Body: fileBuffer,
            ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const updatedMovie = await Movie.findOneAndUpdate(
            { title: movieTitle },
            { poster_url: imageUrl },
            { new: true }
        );

        if (!updatedMovie) {
            return res.status(404).send({ message: 'Movie not found' });
        }

        sendMessage({
            action: 'update_movie_poster_NOSQL',
            data: { title: movieTitle, poster_url: imageUrl },
        });

        res.status(200).send({ message: 'Movie poster updated successfully', movie: updatedMovie });
    } catch (error) {
        console.error('Error updating movie poster:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});


router.delete('/movies/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const movie = await Movie.findById(id);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        movie.poster_url = '';
        await movie.save();

        sendMessage({ action: 'delete_movie_NOSQL', data: { id, title: movie.title } });

        res.json({ message: 'Movie image deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: `Error deleting movie image: ${error.message}` });
    }
});

router.post('/images', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const file = req.file;
    const fileName = `${uuidv4()}-${file.originalname}`
    const imageUrl = `https://docker-lab5.s3.eu-north-1.amazonaws.com/${fileName}`;
    const movieTitle = req.body.caption;

    try {
        const existingMovie = await Movie.findOne({ title: movieTitle });
        if (existingMovie) {
            return res.status(409).send({ message: 'Movie already exists' });
        }

        let fileBuffer;
        if (file.mimetype === 'image/gif') {
            fileBuffer = file.buffer;
        } else {
            fileBuffer = await sharp(file.buffer)
                .resize({
                    height: 1250,
                    width: 1250,
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 1 }
                })
                .toBuffer();
        }

        const params = {
            Bucket: 'docker-lab5',
            Key: fileName,
            Body: fileBuffer,
            ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const newMovie = await createDocument('movies', { title: movieTitle, poster_url: imageUrl });

        sendMessage({
            action: 'create_movie_with_image_NOSQL',
            data: { title: movieTitle, poster_url: imageUrl },
        });

        res.status(201).json({ message: 'New movie created with image', movie: newMovie });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: `Error processing request: ${error.message}` });
    }
});

module.exports = router;

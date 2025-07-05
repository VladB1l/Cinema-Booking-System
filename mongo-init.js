db = db.getSiblingDB('Cinema');


db.createCollection('movies');
db.movies.insertMany([
    {
        _id: ObjectId(),
        title: "The Matrix",
        poster_url: "https://docker-lab5.s3.eu-north-1.amazonaws.com/matrix.png" 
    },
    {
        _id: ObjectId(),
        title: "Inception",
        poster_url: "https://docker-lab5.s3.eu-north-1.amazonaws.com/inception.png" 
    },
    {
        _id: ObjectId(),
        title: "Avatar",
        poster_url: "https://docker-lab5.s3.eu-north-1.amazonaws.com/avatar.png" 
    },
    {
        _id: ObjectId(),
        title: "Real Steel",
        poster_url: "https://docker-lab5.s3.eu-north-1.amazonaws.com/steel.png" 
    },
    {
        _id: ObjectId(),
        title: "Interstellar",
        poster_url: "https://docker-lab5.s3.eu-north-1.amazonaws.com/interstellar.png"
    }
]);

db.createCollection('tickets');
db.tickets.insertMany([
    {
        _id: ObjectId(),
        movie_id: db.movies.findOne({ title: "The Matrix" })._id,
        show_date: "2024-12-18",
        show_time: "18:30",
        seat_number: 1
    },
    {
        _id: ObjectId(),
        movie_id: db.movies.findOne({ title: "The Matrix" })._id,
        show_date: "2024-12-18",
        show_time: "18:30",
        seat_number: 2
    },
    {
        _id: ObjectId(),
        movie_id: db.movies.findOne({ title: "Inception" })._id,
        show_date: "2024-12-19",
        show_time: "20:00",
        seat_number: 5
    },
    {
        _id: ObjectId(),
        movie_id: db.movies.findOne({ title: "Avatar" })._id,
        show_date: "2024-12-20",
        show_time: "19:15",
        seat_number: 10
    },
    {
        _id: ObjectId(),
        movie_id: db.movies.findOne({ title: "Real Steel" })._id,
        show_date: "2024-12-21",
        show_time: "17:45",
        seat_number: 15
    },
    {
        _id: ObjectId(),
        movie_id: db.movies.findOne({ title: "Interstellar" })._id,
        show_date: "2024-12-22",
        show_time: "21:00",
        seat_number: 20
    }
]);



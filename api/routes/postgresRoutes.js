const express = require('express');
const router = express.Router();
const pool = require('../services/postgresService');
const multer = require('multer');
const upload = multer();
const sharp = require('sharp');
const { sendMessage } = require('../services/rabbitmqService');


router.get('/viewers', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM viewers');
        res.status(200).send(data.rows);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});


router.get('/available-tickets', async (req, res) => {
    try {
        const query = `
            SELECT t.id, t.show_date, t.seat_number, t.show_time, t.movie_title
            FROM tickets t
            LEFT JOIN orders o ON t.id = o.ticket_id
            WHERE o.ticket_id IS NULL
        `;
        const result = await pool.query(query);
        res.status(200).send(result.rows);
    } catch (err) {
        console.error('Error fetching available tickets:', err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});


router.get('/orders', async (req, res) => {
    const { date, full_name } = req.query;

    let query = `
        SELECT o.id, v.full_name, t.movie_title, t.show_date, t.show_time, t.seat_number, t.movie_poster
        FROM orders o
        JOIN viewers v ON o.viewer_id = v.id
        JOIN tickets t ON o.ticket_id = t.id
    `;

    const params = [];
    const conditions = [];

    if (date) {
        conditions.push(`t.show_date = $${params.length + 1}`);
        params.push(date);
    }

    if (full_name) {
        conditions.push(`v.full_name = $${params.length + 1}`);
        params.push(full_name);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    try {
        const result = await pool.query(query, params);

        const ordersWithImages = result.rows.map((row) => ({
            ...row,
            movie_poster: row.movie_poster
                ? `data:image/png;base64,${row.movie_poster.toString("base64")}`
                : null,
        }));

        res.status(200).send(ordersWithImages);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


router.delete('/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).send({ message: 'Order not found' });
        }
        sendMessage({ action: 'delete_order_SQL', data: result.rows[0] });
        res.status(200).send({ message: 'Order deleted successfully', order: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


router.post('/orders', async (req, res) => {
    const { viewer_id, ticket_id } = req.body;

    if (!viewer_id || !ticket_id) {
        return res.status(400).send({ message: 'Viewer ID and Ticket ID are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO orders (viewer_id, ticket_id) 
             VALUES ($1, $2) 
             RETURNING id, viewer_id, ticket_id, order_date`,
            [viewer_id, ticket_id]
        );
        sendMessage({ action: 'create_order_SQL', data: result.rows[0] });
        res.status(201).send({ message: 'Order created successfully', order: result.rows[0] });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});


router.put('/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { seat_number } = req.body;

    try {
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1',
            [id]
        );

        if (orderResult.rowCount === 0) {
            return res.status(404).send({ message: 'Order not found' });
        }

        const order = orderResult.rows[0];
        const ticketId = order.ticket_id;

        const ticketResult = await pool.query(
            'UPDATE tickets SET seat_number = $1 WHERE id = $2 RETURNING *',
            [seat_number, ticketId]
        );

        if (ticketResult.rowCount === 0) {
            return res.status(404).send({ message: 'Ticket not found' });
        }

        sendMessage({
            action: 'update_ticket_seat_SQL',
            data: { orderId: id, seat_number },
            updated_ticket: ticketResult.rows[0],
        });

        res.status(200).send({
            message: 'Ticket seat_number updated successfully',
            ticket: ticketResult.rows[0],
        });
    } catch (err) {
        console.error('Error updating ticket:', err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.put('/update-movie-poster', upload.single('image'), async (req, res) => {
    const { movieTitle } = req.body;
    const image = req.file;


    let imageBuffer;
    if (image.mimetype === 'image/gif') {
        imageBuffer = image.buffer
    } else {
        imageBuffer = await sharp(image.buffer)
            .resize({
                width: 690,
                height: 1080,
                fit: sharp.fit.contain,
                background: { r: 0, g: 0, b: 0, alpha: 1 }
            })
            .toBuffer();
    }


    try {
        const result = await pool.query(
            'UPDATE tickets SET movie_poster = $1 WHERE movie_title = $2 RETURNING *',
            [imageBuffer, movieTitle]
        );

        if (result.rowCount === 0) {
            return res.status(404).send({ message: 'Movie not found' });
        }

        sendMessage({
            action: 'update_movie_poster_SQL',
            data: { movieTitle },
            updated_ticket: result.rows[0],
        });

        res.status(200).send({ message: 'Movie poster updated successfully' });
    } catch (err) {
        console.error('Error updating movie poster:', err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

module.exports = router;

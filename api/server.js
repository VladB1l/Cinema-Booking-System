const express = require('express');
const cors = require('cors');
const { connectRabbitMQ } = require('./services/rabbitmqService');

const app = express();
const port = 3000;

const postgresRoutes = require('./routes/postgresRoutes');
const mongoRoutes = require('./routes/mongoRoutes');

app.use(cors());
app.use(express.json());


app.use('/api/postgres', postgresRoutes);
app.use('/api/mongo', mongoRoutes);


connectRabbitMQ().then(() => {
    app.listen(port, () => console.log(`Server has started on port: ${port}`));
});


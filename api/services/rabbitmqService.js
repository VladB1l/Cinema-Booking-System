const amqp = require('amqplib');

let channel;

async function connectRabbitMQ() {
    while (true) {
        try {
            const connection = await amqp.connect('amqp://guest:guest@rabbitmq');
            channel = await connection.createChannel();
            await channel.assertQueue('crud_operations', { durable: true });
            console.log('Connected to RabbitMQ');
            break;
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            console.log('Retrying in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000)); 
        }
    }
}

function sendMessage(message) {
    if (channel) {
        console.log('Sending message to queue:', message);
        channel.sendToQueue('crud_operations', Buffer.from(JSON.stringify(message)), {
            persistent: true
        });
    } else {
        console.error('Channel is not initializeddd Message not sent.');
    }
}

module.exports = { connectRabbitMQ, sendMessage };

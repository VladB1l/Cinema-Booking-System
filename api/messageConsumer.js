const amqp = require('amqplib');

async function startConsumer() {
    while (true) {
        try {
            const connection = await amqp.connect('amqp://guest:guest@rabbitmq');
            const channel = await connection.createChannel();
            await channel.assertQueue('crud_operations', { durable: true });

            console.log('Message consumer waiting for messages...');

            channel.consume('crud_operations', (msg) => {
                if (msg !== null) {
                    try {
                        const content = JSON.parse(msg.content.toString());
                        console.log('Received:', content);
                        channel.ack(msg);
                    } catch (error) {
                        console.error('Error processing message:', error);
                    }
                }
            });

            break;
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            console.log('Retrying in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000)); 
        }
    }
}


startConsumer();

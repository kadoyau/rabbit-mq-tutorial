const amqp = require('amqplib');

class Publisher {
  async publish() {
    try {
      const msg = process.argv.slice(2).join(' ') || 'Hello World!';

      const conn = await amqp.connect('amqp://localhost');
      const ch = await conn.createChannel();
      const q = 'task_queue';
      await ch.assertQueue(q, { durable: true });
      await ch.sendToQueue(q, Buffer.from(msg), { persistent: true });
      console.log('Sent %s', msg);

      await ch.close();
      await conn.close();
    } catch (err) {
      console.log(err);
    }
  }
}


(async () => {
  const publisher = new Publisher();
  return publisher.publish();
})();


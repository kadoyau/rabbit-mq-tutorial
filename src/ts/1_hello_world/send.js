const amqp = require('amqplib');

class Publisher {
  async publish() {
    try {
      const conn = await amqp.connect('amqp://localhost');
      const ch = await conn.createChannel();
      const q = 'hello';
      await ch.assertQueue(q, { durable: false });
      await ch.sendToQueue(q, Buffer.from('Hello World'));
      console.log('send!');

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


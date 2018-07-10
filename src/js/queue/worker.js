// @flow
const amqp = require('amqplib');

class Consumer {
  async consume() {
    try {
      const conn = await amqp.connect('amqp://localhost');
      const ch = await conn.createChannel();
      // publisherより先に開始するのでqueueがあるか確認する
      const q = 'task_queue';
      await ch.assertQueue(q, { durable: true });
      await ch.consume(q, (msg) => {
        const secs = msg.content.toString().split('.').length - 1;
        console.log('Recv: %s', msg.content.toString());
        setTimeout(() => {
          console.log('Done');
        }, secs * 1000);
      }, { noAck: false });
      // await ch.close();
      // await conn.close();
    } catch (err) {
      console.log(err);
    }
  }
}


(async () => {
  const consumer = new Consumer();
  return consumer.consume();
})();

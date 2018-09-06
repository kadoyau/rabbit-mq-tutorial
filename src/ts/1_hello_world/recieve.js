const amqp = require('amqplib');

class Consumer {
  async consume() {
    try {
      const conn = await amqp.connect('amqp://localhost');
      const ch = await conn.createChannel();
      // publisherより先に開始するのでqueueがあるか確認する
      const q = 'hello';
      await ch.assertQueue(q, {durable: false});
      await ch.consume(q, (msg) => {
        console.log('Recv: %s', msg.content.toString());
      }, {noAck: true});

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

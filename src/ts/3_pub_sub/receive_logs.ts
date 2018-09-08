const amqp = require('amqplib');

/**
 * pub/subのsubscriber
 * 複数起動すると適当なキューが生成される
 * コネクションを破棄するとキューも破棄される
 */
class Receiver {
  static async receive() {
    try {
      const conn = await amqp.connect('amqp://localhost');
      const ch = await conn.createChannel();

      const exchange = 'logs';
      // exchangeを作成する
      ch.assertExchange(exchange, 'fanout', { durable: false });

      const queueName = '';
      // キュー名が空なので、RabbitMQはランダムなキュー名を返してくれる
      // exclusive: trueなのでコネクションが閉じられるとキューが破棄される
      const q = await ch.assertQueue(queueName, { durable: false, exclusive: true });
      console.log('[*] Waiting for messages in %s. To exit press CTRL+C', q.queue);

      // exchangeとキューをbindする
      ch.bindQueue(/* queue name */ q.queue, /* exchange name */ exchange, '');

      // メッセージを受け取る
      ch.consume(q.queue, (receivedMsg: any) => {
        console.log(' [x] %s', receivedMsg.content.toString());
      }, { noAck: true });
    } catch (err) {
      console.log(err);
    }
  }
}

Receiver.receive();

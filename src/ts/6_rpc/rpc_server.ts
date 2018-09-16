const amqp = require('amqplib');

/**
 * pub/subのsubscriber
 * 複数起動すると適当なキューが生成される
 * コネクションを破棄するとキューも破棄される
 */
class ReceiverTopic {
  static async receive() {
    try {
      const args = process.argv.slice(2);
      if (args.length === 0) {
        console.log('Usage: receive_logs_topic.js <facility>.<severity>');
        process.exit(1);
      }
      const conn = await amqp.connect('amqp://localhost');
      const ch = await conn.createChannel();

      const exchange = 'topic_logs';
      // type=topicなexchangeを作成する
      ch.assertExchange(exchange, 'topic', { durable: false });

      const queueName = '';
      // キュー名が空なので、RabbitMQはランダムなキュー名を返してくれる
      // exclusive: trueなのでコネクションが閉じられるとキューが破棄される
      const q = await ch.assertQueue(queueName, { durable: false, exclusive: true });
      console.log('[*] Waiting for messages in %s. To exit press CTRL+C', q.queue);

      // すべてのseverityとbind
      args.forEach((severity) => {
        ch.bindQueue(/* queue name */ q.queue, /* exchange name */ exchange, severity);
      });

      // メッセージを受け取る
      ch.consume(q.queue, (receivedMsg: any) => {
        console.log(' [x] %s: "%s"', receivedMsg.fields.routingKey, receivedMsg.content.toString());
      }, { noAck: true });
    } catch (err) {
      console.log(err);
    }
  }
}

ReceiverTopic.receive();

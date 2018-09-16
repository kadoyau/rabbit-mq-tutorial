const amqp = require('amqplib');

/**
 * pub/subのpublisher
 * exchangeにメッセージをpublishする
 */
class EmitterTopic {
  static async emit() {
    try {
      const conn = await amqp.connect('amqp://localhost');
      const ch = await conn.createChannel();

      const exchange = 'topic_logs';
      const args = process.argv.slice(2);
      const routingKey = (args.length > 0) ? args[0] : 'anonymous.info';
      const msg = process.argv.slice(3).join(' ') || 'Hello World!';

      // exchangeを作成する
      ch.assertExchange(exchange, 'topic', { durable: false });

      // logs exchangeにメッセージをつむ。特定のキューにはメッセージを入れない
      ch.publish(exchange, routingKey, Buffer.from(msg), { persistent: true });
      console.log('[x] Sent %s: "%s"',routingKey, msg);

      setTimeout(() => {
        ch.close();
        conn.close();
      }, 500);
    } catch (err) {
      console.log(err);
    }
  }
}

EmitterTopic.emit();

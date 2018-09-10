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

      const exchange = 'direct_logs';
      const args = process.argv.slice(2);
      const severity = (args.length > 0) ? args[0] : 'info';
      const msg = process.argv.slice(3).join(' ') || 'Hello World!';

      // exchangeを作成する
      ch.assertExchange(exchange, 'direct', { durable: false });

      // logs exchangeにメッセージをつむ。特定のキューにはメッセージを入れない
      ch.publish(exchange, severity, Buffer.from(msg), { persistent: true });
      console.log('[x] Sent %s: "%s"',severity, msg);

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

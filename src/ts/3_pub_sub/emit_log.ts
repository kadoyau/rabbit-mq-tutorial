const amqp = require('amqplib');

/**
 * pub/subのpublisher
 * exchangeにメッセージをpublishする
 */
class Emitter {
  static async emit() {
    try {
      const conn = await amqp.connect('amqp://localhost');
      const ch = await conn.createChannel();

      const exchange = 'logs';
      const msg = process.argv.slice(2).join(' ') || 'Hello World!';
      // exchangeを作成する
      ch.assertExchange(exchange, 'fanout', { durable: false });

      // logs exchangeにメッセージをつむ。特定のキューにはメッセージを入れない
      ch.publish(exchange, '', Buffer.from(msg), { persistent: true });
      console.log('[x] Sent %s', msg);

      setTimeout(() => {
        ch.close();
        conn.close();
      }, 500);
    } catch (err) {
      console.log(err);
    }
  }
}

Emitter.emit();

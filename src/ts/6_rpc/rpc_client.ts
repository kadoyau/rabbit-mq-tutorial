const amqp = require('amqplib');

/**
 * pub/subのpublisher
 * exchangeにメッセージをpublishする
 */
class RpcClient {
  static async emit() {
    try {
      const args = process.argv.slice(2);
      if (args.length === 0) {
        console.log('Usage: rpc_client.js num');
        process.exit(1);
      }
      const conn = await amqp.connect('amqp://localhost');
      const ch = await conn.createChannel();
      const callbackQueue = await ch.assertQueue('', { exclusive: true });

      const correlationId = this.generateUUid();
      const num = parseInt(args[0], 10);

      console.log(' [x] Requesting fib(%d)', num);

      // レスポンス先に指定したキューにつまれたレスポンスを受け取る
      ch.consume(callbackQueue.queue, (msg: any) => {
        if (msg.properties.correlationId === correlationId) {
          console.log(' [.] Got %s', msg.content.toString());
          setTimeout(() => {
            conn.close();
            process.exit(0);
          }, 500);
        }
      }, { noAck: true });

      // キューにjobを積む
      const queueName = 'rpc_queue';
      ch.sendToQueue(
        queueName,
        Buffer.from(num.toString()),
        // ユニークなIDとレスポンス先のキューを指定する
        { correlationId: correlationId, replyTo: callbackQueue.queue }
      );

    } catch (err) {
      console.log(err);
    }
  }

  private static generateUUid() {
    return Math.random().toString()
      + Math.random().toString()
      + Math.random().toString();
  }
}

RpcClient.emit();

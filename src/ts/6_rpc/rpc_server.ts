const amqp = require('amqplib');

/**
 * pub/subのsubscriber
 * 複数起動すると適当なキューが生成される
 * コネクションを破棄するとキューも破棄される
 */
class RpcServer {

  static async receive() {
    try {
      const conn = await amqp.connect('amqp://localhost');
      const ch = await conn.createChannel();
      // 複数ワーカを扱うときの設定
      ch.prefetch(1); // 1より大きな仕事を割り当てられない

      // exchangeは指定していないので適当なものが使われる
      const queueName = 'rpc_queue';
      // exclusive: trueなのでコネクションが閉じられるとキューが破棄される
      await ch.assertQueue(queueName, { durable: false, exclusive: true });
      console.log(' [x] Awaiting RPC requests');

      // キューからメッセージを受け取る
      ch.consume(queueName, (receivedMsg: any) => {
        const n = parseInt(receivedMsg.content.toString(), 10);
        console.log(' [.] fib(%d)', n);
        const r = this.fibonacci(n);
        // callbackキューにレスポンスを送る
        console.log(`replyTo:  ${receivedMsg.properties.replyTo}`);
        ch.sendToQueue(
          receivedMsg.properties.replyTo,
          Buffer.from(r.toString()),
          { correlationId: receivedMsg.properties.correlationId }
        );
        ch.ack(receivedMsg);
      });
    } catch (err) {
      console.log(err);
    }
  }

  private static fibonacci(n: number): number {
    if (n === 0 || n === 1) {
      return n;
    }
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}

RpcServer.receive();

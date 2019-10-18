/*
运行:
----------  这个主要是父子之间通信  ----------
node --experimental-worker  qc_woker_threads.js 
由于 worker_thread 目前仍然处于实验阶段，所以启动时需要增加 --experimental-worker flag

isMainThread: 是否是主线程，源码中是通过 threadId === 0 进行判断的。
MessagePort: 用于线程之间的通信，继承自 EventEmitter。
MessageChannel: 用于创建异步、双向通信的通道实例。
threadId: 线程 ID。
Worker: 用于在主线程中创建子线程。第一个参数为 filename，表示子线程执行的入口。
parentPort: 在 worker 线程里是表示父进程的 MessagePort 类型的对象，在主线程里为 null
workerData: 用于在主进程中向子进程传递数据（data 副本）

作者：腾讯IVWEB团队
链接：https://juejin.im/post/5c63b5676fb9a049ac79a798
来源：掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。


*/

/*

bogon:desktop zack$ node --experimental-worker  qc_woker_threads.js

worker: workerDate 0
main: receive 0
worker: receive 1


worker: workerDate 1
main: receive 1
worker: receive 2


worker: workerDate 2
main: receive 2
worker: workerDate 3
main: receive 3
worker: receive 3
worker: receive 4
worker: workerDate 4
main: receive 4

*/


const {
    isMainThread,
    parentPort,
    workerData,
    threadId,
    MessageChannel,
    MessagePort,
    Worker
  } = require('worker_threads');
  
  
  function mainThread() {
    for (let i = 0; i < 5; i++) {
      //1.Woker用于在主线程中创建子线程，第一个参数是filenemae，表示子线程执行的入口；workerData用于主线程向子线程传递数据
      const worker = new Worker(__filename, { workerData: i });
      //end：针对主线程，退出的监听
      worker.on('exit', code => { console.log(`main: worker stopped with exit code ${code}`); });
      
      //3.主线程接收到数据，并向子线程+1发送数据
      worker.on('message', msg => {
        console.log(`main: receive ${msg}`);
        worker.postMessage(msg + 1);
      });
    }
  }
  
  function workerThread() {
    //2.接1，然后运行的是这个，意味这worker创建，传递过来的workerData是0
    console.log(`worker: workerDate ${workerData}`);

    //4.子线程收到数据，输出为1，依次重复
    parentPort.on('message', msg => {
      console.log(`worker: receive ${msg}`);
    }),

    //3.parentPort 在 worker 线程里是表示父进程的 MessagePort 类型的对象，在主线程里为 null；向主线程发送数据
    parentPort.postMessage(workerData);
  }
  
  //如果threadId === 0 ，也就是第一次创建，我们运行mainThread创建所有线程，
  //也就是说，mianThread只执行一次，其他的都是wokerThread方法
  if (isMainThread) {
    mainThread();
  } else {
    //其他的都是运行work
    workerThread();
  }
  

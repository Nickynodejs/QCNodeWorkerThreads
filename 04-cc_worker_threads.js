/*
---------这个主要是子线程之间数据交互--------------
---------不过用的比较少--------------------------
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
const path = require('path');

const { port1, port2 } = new MessageChannel();
if (isMainThread) {
    const worker1 = new Worker(__filename);
    const worker2 = new Worker(path.join(__dirname, '05-cc_worker.js'));

    worker1.postMessage({ port1 }, [ port1 ]);
    worker2.postMessage({ port2 }, [ port2 ]);
} else {
	parentPort.once('message', ({ port1 }) => {
        console.log('子线程1收到port1', port1);
        port1.once('message', (msg) => {
            console.log('子线程1收到', msg);
        })

        port1.postMessage('port1 向 port2 发消息啦');
    })
}


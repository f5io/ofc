const { threadId, parentPort } = require('worker_threads');
const worker = require('./worker');

parentPort.on('message', workerData => {
  worker.run({ parentPort, threadId, workerData });
});

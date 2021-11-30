const os = require('os');
const exec = require('child_process').exec;
const { dialog } = require('electron');

async function start(app, logs) {
  let system = os.type();
  let cmdStr = './aurora --config=aurorafs.yaml start';
  let cmdPath = './aurora/';

  let workerProcess;
  await runExec(cmdStr);
  return workerProcess;

  async function runExec(cmdStr) {
    workerProcess = exec(cmdStr, { cwd: cmdPath });

    workerProcess.on('exit', () => {
      if (system !== 'windows') {
        exec(`kill ${workerProcess.pid + 1}`, { cwd: cmdPath });
      } else {
        exec(`taskkill -pid ${workerProcess.pid + 1} -f`, { cwd: cmdPath });
      }
    });

    workerProcess.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
      logs.push(data);
    });
    workerProcess.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
      logs.push(data);
      dialog
        .showMessageBox({
          type: 'error',
          title: 'Node Error',
          message: data,
        })
        .then(() => {
          app.quit();
        });
    });
    workerProcess.on('close', function (code) {
      console.log('out code:' + code);
    });
  }
}

module.exports = {
  start,
};

const os = require('os');
const exec = require('child_process').exec;
const { dialog } = require('electron');
const kill = require('kill-port');

async function start(app, logs) {
  let cmdStr =
    os.platform() === 'win32'
      ? 'aurora.exe --config=aurora.yaml start'
      : './aurora --config=aurora.yaml start';
  let cmdPath = 'aurora';

  let workerProcess;
  await runExec(cmdStr);
  return workerProcess;

  async function runExec(cmdStr) {
    workerProcess = exec(cmdStr, { cwd: cmdPath });

    workerProcess.on('exit', async () => {
      try {
        await kill(1635);
      } catch (e) {
        console.log(e);
      }
      workerProcess.kill();
      app.quit();
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

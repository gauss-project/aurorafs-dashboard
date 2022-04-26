const os = require('os');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

let cmdPath = 'aurora';

let writeLog = (log) => {
  let fileName = 'aurora__' + moment().format('YYYY_MM_DD') + '.log';
  fs.appendFile(path.join(cmdPath, fileName), log, (err) => {
    console.log(err);
  });
};

async function run({ win, logs }) {
  let startCmd = os.platform() === 'win32' ? 'aurora.exe' : './aurora';

  let config = fs.readFileSync('./aurora/aurora.yaml', { encoding: 'utf-8' });
  let url = 'http://localhost:';
  let api = url + config.match(/api-addr: :(\d*)/)[1];

  return runExec();

  async function runExec() {
    let workerProcess = spawn(startCmd, ['--config=aurora.yaml', 'start'], {
      cwd: cmdPath,
    });
    let timer = setInterval(() => {
      if (win.isStart) {
        clearInterval(timer);
        win.webContents.send('stopLoading');
      }
    }, 1000);
    let notStart = true;
    workerProcess.stdout.on('data', (data) => {
      let log = data.toString();
      console.log('stdout:' + log);
      let re = /\Sapi address: http(s?):\/\/\[::]:(\d*)/;
      if (notStart && re.test(log)) {
        notStart = false;
        win.webContents.send('start', { api });
      }
      writeLog(log);
      let n = logs.push(log);

      if (n >= 300) logs.splice(0, 100);
    });

    workerProcess.stderr.on('data', (data) => {
      let log = data.toString();
      console.log('stdout:' + log);
      logs.push(log);
      writeLog(log);
    });

    workerProcess.on('close', function (code) {
      console.log('out code:' + code);
    });
    return workerProcess;
  }
}

module.exports = {
  run,
};

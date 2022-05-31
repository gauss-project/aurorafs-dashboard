const os = require('os');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

let cmdPath = 'aurora';
let workerProcess;

let winStart = false;

let timer = null;

function run({ win, logs }) {
  let startCmd = os.platform() === 'win32' ? 'aurora.exe' : './aurora';
  let config = fs.readFileSync('./aurora/aurora.yaml', { encoding: 'utf-8' });
  let url = 'http://localhost:';
  let api = url + config.match(/api-addr: :(\d*)/)[1];

  win.once('kill', () => {
    clearTimeout(timer);
    workerProcess.kill();
  });

  return runExec();

  function runExec() {
    workerProcess = spawn(startCmd, ['--config=aurora.yaml', 'start'], {
      cwd: cmdPath,
    });

    if (winStart) {
      win.webContents.send('stopLoading');
    } else {
      win.webContents.once('did-finish-load', () => {
        winStart = true;
        win.webContents.send('toPath', '/log');
        win.webContents.send('stopLoading');
      });
    }

    let notStart = true;

    let writeLog = (log) => {
      let fileName = 'aurora__' + moment().format('YYYY_MM_DD') + '.log';
      fs.appendFile(path.join(cmdPath, fileName), log, (err) => {
        if (err) console.log(err);
      });
    };

    workerProcess.stdout.on('data', (data) => {
      let log = data.toString();
      console.log('stdout:' + log);
      // let re = /\Sapi address: http(s?):\/\/\[::]:(\d*)/;
      let re = /\Srpc websocket address:\s\[::]:(\d*)/;
      if (notStart && re.test(log)) {
        console.log(api);
        notStart = false;
        win.webContents.send('start', { api });
      }
      let n = logs.push(log);
      if (n >= 300) logs.splice(0, 100);
      writeLog(log);
    });

    workerProcess.stderr.on('data', (data) => {
      let log = data.toString();
      console.log('stdout:' + log);
      logs.push(log);
      writeLog(log);
    });

    workerProcess.on('close', function (code) {
      if (code) {
        logs.push('-'.repeat(100));
        timer = setTimeout(() => {
          runExec();
        }, 3000);
      }
      console.log('out code:' + code);
    });
  }
}

module.exports = {
  run,
};

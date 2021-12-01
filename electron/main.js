// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');
const { ipcMain } = require('electron');
const { start } = require('./run');
const { checkStatus } = require('./util');
const fs = require('fs');

let tray;
let logs = [];
let workerProcess;

function quit() {
  workerProcess.emit('exit', true);
}

function createWindow() {
  Menu.setApplicationMenu(null);
  // Create the browser window.
  let win = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
  });
  checkStatus(win);
  // Create the menu
  tray = new Tray('./public/logo.png'); // sets tray icon image
  const contextMenu = Menu.buildFromTemplate([
    // define menu items
    {
      label: 'Restart',
      click: async () => {
        logs = [];
        win.webContents.send('restart');
        workerProcess.emit('exit');
        workerProcess = await start(app, logs, ipcMain);
        checkStatus(win);
      }, // click event
    },
    {
      label: 'Exit',
      click: () => quit(),
    },
  ]);
  tray.setContextMenu(contextMenu);

  // and load the index.html of the app.
  win.loadFile('./dist/index.html');
  // win.loadURL("http://192.168.100.26:8000");

  win.webContents.addListener(
    'new-window',
    (event, url, frameName, disposition, options) => {
      event.preventDefault();
      let openWin = new BrowserWindow({
        webPreferences: {
          webSecurity: false,
        },
      });
      openWin.loadURL(url);
      openWin.webContents.session.addListener(
        'will-download',
        (evt, item, webContents) => {
          item.on('done', () => {
            openWin.destroy();
          });
        },
      );
    },
  );

  win.maximize();
  win.show();

  // Open the DevTools.
  // win.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('ready', async function () {
  workerProcess = await start(app, logs, ipcMain);
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('config', (event) => {
  fs.readFile('./aurora/aurora.yaml', 'utf-8', function (err, data) {
    console.log(typeof data);
    event.reply('config', { err, data });
  });
});

ipcMain.on('save', (event, message) => {
  fs.writeFile('./aurora/aurora.yaml', message, (err, data) => {
    event.reply('save', { err, data });
  });
});

ipcMain.on('reset', (event) => {
  fs.readFile('./aurora/.aurora', 'utf-8', function (err, data) {
    event.reply('reset', { err, data });
  });
});

ipcMain.on('logs', (event) => {
  event.reply('logs', logs);
});

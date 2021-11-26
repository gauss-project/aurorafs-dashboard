const axios = require('axios');

const getStatus = async () => {
  try {
    await axios.get('http://localhost:1633');
    return true;
  } catch (e) {
    return false;
  }
};

const checkStatus = (win) => {
  let n = 1;
  let timer = setInterval(async () => {
    n++;
    const status = await getStatus();
    if (status || n > 15) {
      clearInterval(timer);
      win.webContents.send('start');
    }
  }, 2000);
};
module.exports = {
  getStatus,
  checkStatus,
};

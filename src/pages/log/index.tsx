import React, { useEffect, useState } from 'react';

import styles from './index.less';
import { useHistory, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import { Event } from 'electron';
import NotConnected from '@/components/notConnected';

let ipcRenderer: any;
if (window.navigator.userAgent.toLowerCase().indexOf('electron') !== -1) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

const Main: React.FC = () => {
  const history = useHistory();
  const { electron } = useSelector((state: Models) => state.global);
  if (!electron) history.push('/404');
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    ipcRenderer.on('logs', (event: Event, data: []) => {
      console.log(
        document.documentElement.scrollHeight,
        document.body.clientHeight,
        document.documentElement.scrollTop,
      );
      const isBottom =
        document.documentElement.scrollHeight ===
        document.body.clientHeight + document.documentElement.scrollTop;
      setLogs(data);
      if (isBottom) {
        window.scrollTo(0, document.body.scrollHeight);
      }
    });
    ipcRenderer.send('logs');
    let timer = setInterval(() => {
      ipcRenderer.send('logs');
    }, 5000);
    return () => {
      clearInterval(timer);
      ipcRenderer.removeAllListeners('logs');
    };
  }, []);
  return (
    <div className={styles.content}>
      <div className={styles.text}>
        {logs.map((item, index) => {
          return (
            <div key={index} style={{ marginTop: 10, fontSize: 12 }}>
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Log: React.FC = (props) => {
  const { status } = useSelector((state: Models) => state.global);
  return <>{status ? <Main /> : <NotConnected />}</>;
};
export default Log;

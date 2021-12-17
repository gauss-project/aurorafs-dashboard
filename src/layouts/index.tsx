import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useHistory, useSelector, useDispatch } from 'umi';
import styles from './index.less';
import classNames from 'classnames';
import 'nprogress/nprogress.css';
import {
  HomeOutlined,
  FileTextOutlined,
  PartitionOutlined,
  SettingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';

import { Models } from '@/declare/modelType';
import Loading from '@/components/loading';

import { version, isElectron } from '@/config/version';
import { eventEmitter } from '@/utils/request';
import logoImg from '@/assets/img/logo.png';
import { getSize } from '@/utils/util';
import { speedTime } from '@/config/url';
import semver from 'semver';
import dollarTransferSvg from '@/assets/icon/dollar-transfer.svg';

let ipcRenderer: any = null;
if (isElectron) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

type Nav = {
  text: string;
  router: string;
  icon?: JSX.Element;
};
type ClickHandle = (path: string) => void;

const Layouts: React.FC = (props) => {
  const dispatch = useDispatch();
  const { status, metrics, api, debugApi, refresh, health, electron } =
    useSelector((state: Models) => state.global);
  const history = useHistory();
  const path = useLocation().pathname;
  const [active, setActive] = useState(path);
  const navList: Nav[] = [
    {
      text: 'Info',
      router: '/',
      icon: <HomeOutlined />,
    },
    {
      text: 'Peers',
      router: '/peers',
      icon: <PartitionOutlined />,
    },
    {
      text: 'Files',
      router: '/files',
      icon: <FileTextOutlined />,
    },
    {
      text: 'Log',
      router: '/log',
      icon: <FieldTimeOutlined />,
    },
    {
      text: 'Accounting',
      router: '/accounting',
      icon: <img src={dollarTransferSvg} width={20} alt={''} />,
    },
    {
      text: 'Settings',
      router: '/setting',
      icon: <SettingOutlined />,
    },
  ];
  let timer = useRef<null | NodeJS.Timer>(null);

  const getMetrics = (url: string, init: boolean = false) => {
    dispatch({
      type: 'global/getMetrics',
      payload: { url, init },
    });
  };
  const clickHandle: ClickHandle = (newPath) => {
    if (path !== newPath) {
      history.push(newPath);
    }
  };

  useEffect(() => {
    setActive(path);
  }, [path]);
  useEffect(() => {
    if (electron) {
      ipcRenderer.on('start', () => {
        dispatch({
          type: 'global/getStatus',
          payload: {
            api,
            debugApi,
          },
        });
      });
      ipcRenderer.on('restart', () => {
        dispatch({
          type: 'global/setRefresh',
          payload: {
            refresh: true,
          },
        });
        dispatch({
          type: 'global/setStatus',
          payload: {
            status: false,
          },
        });
      });
    } else {
      dispatch({
        type: 'global/getStatus',
        payload: {
          api,
          debugApi,
        },
      });
    }
    dispatch({
      type: 'global/setRefresh',
      payload: {
        refresh: true,
      },
    });
    eventEmitter.on('404', () => {
      dispatch({
        type: 'global/setStatus',
        payload: { status: false },
      });
    });
  }, []);
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (status) {
      getMetrics(debugApi, true);
      timer.current = setInterval(() => {
        getMetrics(debugApi);
      }, speedTime);
    }
  }, [status, debugApi, api]);
  return (
    <>
      <div className={styles.app}>
        <div className={styles.app_left}>
          <div className={styles.menu}>
            <div className={styles.logo}>
              <a href={'#/'}>
                <img src={logoImg} className={styles.logoImg} />
                <span className={styles.logoText}>AuroraFS</span>
              </a>
            </div>
            <div style={{ height: '10px', backgroundColor: '#fafafa' }} />
            <nav className={styles.nav}>
              <ul>
                {navList.map((item, index) => {
                  if (!electron && item.text === 'Log') {
                    return <div key={index} />;
                  }
                  return (
                    <li
                      key={index}
                      onClick={() => clickHandle(item.router)}
                      className={classNames({
                        [styles.active]: active === item.router,
                      })}
                    >
                      {item.icon ? (
                        <span className={styles.navIcon}> {item.icon}</span>
                      ) : (
                        <></>
                      )}
                      <span className={styles.navText}>{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className={styles.statusInfo}>
              {status && (
                <div style={{ marginBottom: 20, fontSize: 14 }}>
                  <span className={'uploadColor'}>
                    <ArrowUpOutlined />
                    {getSize(
                      (metrics.uploadSpeed * 256) / (speedTime / 1000),
                      1,
                    )}
                    /s
                  </span>
                  <span className={'mainColor'} style={{ marginLeft: 10 }}>
                    <ArrowDownOutlined />
                    {getSize(
                      (metrics.downloadSpeed * 256) / (speedTime / 1000),
                      1,
                    )}
                    /s
                  </span>
                </div>
              )}
              <div className={status ? styles.connected : styles.disconnected}>
                {status ? 'Connected' : 'Disconnected'}
              </div>
              <div>
                Version:{version}
                {status && `(${semver.coerce(health?.version)})`}
              </div>
            </div>
          </div>
        </div>
        <article className={styles.app_right}>{props.children}</article>
      </div>
      {refresh && <Loading text={'loading...'} status={refresh} />}
    </>
  );
};
export default Layouts;

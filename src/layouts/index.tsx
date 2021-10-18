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
} from '@ant-design/icons';

import { Models } from '@/declare/modelType';
import Loading from '@/components/loading';

import { version } from '@/config/version';
import { eventEmitter } from '@/utils/request';
import logoImg from '@/assets/img/logo.png';

type Nav = {
  text: string;
  router: string;
  icon?: JSX.Element;
};
type ClickHandle = (path: string) => void;

const Layouts: React.FC = (props) => {
  const dispatch = useDispatch();
  const { api, debugApi, refresh } = useSelector(
    (state: Models) => state.global,
  );
  const { status } = useSelector((state: Models) => state.global);
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
      text: 'Setting',
      router: '/setting',
      icon: <SettingOutlined />,
    },
  ];
  const clickHandle: ClickHandle = (newPath) => {
    if (path !== newPath) {
      history.push(newPath);
    }
  };

  useEffect(() => {
    setActive(path);
  }, [path]);
  useEffect(() => {
    dispatch({
      type: 'global/setRefresh',
      payload: {
        refresh: true,
      },
    });
    dispatch({
      type: 'global/getStatus',
      payload: {
        api,
        debugApi,
      },
    });
    eventEmitter.on('404', () => {
      dispatch({
        type: 'global/setStatus',
        payload: { status: false },
      });
    });
  }, []);

  return (
    <>
      <div className={styles.app}>
        <div className={styles.app_left}>
          <div className={styles.menu}>
            <div className={styles.logo}>
              <a href={'/'}>
                <img src={logoImg} className={styles.logoImg} />
                <span className={styles.logoText}>AuroraFS</span>
              </a>
            </div>
            <div style={{ height: '10px', backgroundColor: '#fafafa' }} />
            <nav className={styles.nav}>
              <ul>
                {navList.map((item, index) => {
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
              <div className={status ? styles.connected : styles.disconnected}>
                {status ? 'Connected' : 'Disconnected'}
              </div>
              <div>Version:{version}</div>
            </div>
          </div>
        </div>
        <article className={styles.app_right}>{props.children}</article>
      </div>
      {refresh && (
        <Loading text={'Node connection in progress'} status={refresh} />
      )}
    </>
  );
};
export default Layouts;

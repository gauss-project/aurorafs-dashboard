import React, { useEffect, useState } from 'react';
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

type Nav = {
  text: string,
  router: string,
  icon?: JSX.Element,
}
type ClickHandle = (path: string) => void

const Layouts: React.FC = (props) => {
  const dispatch = useDispatch();
  const { api, debugApi, refresh } = useSelector((state: Models) => state.global);
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
      text: 'Files',
      router: '/files',
      icon: <FileTextOutlined />,
    },
    {
      text: 'Peers',
      router: '/peers',
      icon: <PartitionOutlined />,
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
        api, debugApi,
      },
    });
  }, [api, debugApi]);
  return (
    <>
      <div className={styles.main}>
        <div className={styles.main_left}>
          {/*logo*/}
          <div className={styles.logo} onClick={() => {
            clickHandle('/');
          }}>
            <img src={require('@/assets/img/logo.png')} className={styles.logoImg} />
            <span className={styles.logoText}>AuFS</span>
          </div>
          {/*null*/}
          <div style={{ height: '10px', backgroundColor: '#fafafa' }}></div>
          {/*nav*/}
          <nav className={styles.nav}>
            <ul>
              {
                navList.map((item, index) => {
                  return <li key={index} onClick={() => clickHandle(item.router)}
                             className={classNames({ [styles.active]: active === item.router })}>
                    {
                      item.icon ? <span className={styles.navIcon}> {item.icon}</span> : <></>
                    }
                    <span className={styles.navText}>{item.text}</span>
                  </li>;
                })
              }
            </ul>
          </nav>
        </div>
        <article className={styles.main_right}>
          {props.children}
        </article>
      </div>
      {
        refresh && <Loading text={'Node connection in progress'} status={refresh} />
      }
    </>
  );
};
export default Layouts;

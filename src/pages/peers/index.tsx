import React, { useEffect, useState } from 'react';
import styles from './index.less';
import NotConnected from '@/components/notConnected';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import Card from '@/components/card';
import PeersList from '@/components/peersList';
import { time } from '@/config/url';
import classNames from 'classnames';

const Main: React.FC = () => {
  const dispatch = useDispatch();
  const [peersList, setPeersList] = useState('full');
  const { debugApi, topology } = useSelector((state: Models) => state.global);
  const { peers } = useSelector((state: Models) => state.peers);
  const getInfo = () => {
    dispatch({
      type: 'global/getTopology',
      payload: {
        url: debugApi,
      },
    });
    dispatch({
      type: 'peers/getPeers',
      payload: {
        url: debugApi,
      },
    });
  };
  useEffect(() => {
    getInfo();
    let timer = setInterval(getInfo, time);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <>
      <div>
        <div>
          <Card
            title={'Discovered Full Peers'}
            text={
              (topology?.population || 0) +
              (topology?.bootNodes?.connected || 0)
            }
          />
        </div>
        <div style={{ display: 'flex', marginTop: '30px' }}>
          <Card
            title={'Connected Full Peers'}
            text={
              (topology?.connected || 0) + (topology?.bootNodes?.connected || 0)
            }
            style={{ flex: 1, marginRight: '50px' }}
          />
          <Card
            title={'Connected Light Peers'}
            text={topology?.lightNodes?.connected || 0}
            style={{ flex: 1, marginRight: '50px' }}
          />
          <Card
            title={'Depth'}
            text={topology?.depth || 0}
            style={{ flex: 1 }}
          />
        </div>
        <div className={styles.peers}>
          <div style={{ display: 'flex' }}>
            <h3
              className={classNames({
                [styles.peersList]: true,
                [styles.peersListSelect]: peersList === 'full',
              })}
              onClick={() => {
                setPeersList('full');
              }}
            >
              Full Peers
            </h3>
            <h3
              className={classNames({
                [styles.peersList]: true,
                [styles.peersListSelect]: peersList === 'light',
              })}
              onClick={() => {
                setPeersList('light');
              }}
            >
              Light Peers
            </h3>
          </div>
          <PeersList
            peers={peers.filter(
              (item) => item.fullNode === (peersList === 'full'),
            )}
          />
        </div>
      </div>
    </>
  );
};

const Peers: React.FC = (props) => {
  const { status } = useSelector((state: Models) => state.global);
  return <>{status ? <Main /> : <NotConnected />}</>;
};

export default Peers;

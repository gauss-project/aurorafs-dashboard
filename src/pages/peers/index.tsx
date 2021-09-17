import React, { useEffect } from 'react';
import styles from './index.less';
import NotConnected from '@/components/notConnected';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import Card from '@/components/card';
import PeersList from '@/components/peersList';
import { time } from '@/config/url';

const Main: React.FC = () => {
  const dispatch = useDispatch();
  const { debugApi, topology } = useSelector((state: Models) => state.global);
  const { peers } = useSelector((state: Models) => state.peers);
  const getInfo = () => {
    dispatch({
      type: 'global/getTopology',
      payload: {
        url:debugApi,
      },
    });
    dispatch({
      type: 'peers/getPeers',
      payload: {
        url:debugApi,
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
  return <>
    <div style={{ width: '1200px' }}>
      <div>
        <Card title={'Discovered Peers'} text={topology?.population || 0} />
      </div>
      <div style={{ display: 'flex', marginTop: '30px' }}>
        <Card title={'Connected Storage/Relay Peers'} text={topology?.connected || 0}
              style={{ flex: 1, marginRight: '50px' }} />
        <Card title={'Connected Light Peers'} text={topology?.lightNodes?.connected || 0}
              style={{ flex: 1, marginRight: '50px' }} />
        <Card title={'Depth'} text={topology?.depth || 0} style={{ flex: 1 }} />
      </div>
      <div className={styles.peers}>
        <h3>Storage/Relay Peers</h3>
        <PeersList peers={peers} />
      </div>
    </div>
  </>;
};

const Peers: React.FC = (props) => {
  const { status } = useSelector((state: Models) => state.global);
  return <>
    {
      status ?
        <Main />
        :
        <NotConnected />
    }
  </>;
};

export default Peers;

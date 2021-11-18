import React, { useEffect } from 'react';
import NotConnected from '@/components/notConnected';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import Card from '@/components/card';
import styles from './index.less';
import { time } from '@/config/url';
import Speed from '@/components/speed';

const Main: React.FC = () => {
  const dispatch = useDispatch();
  const { debugApi, health, topology } = useSelector(
    (state: Models) => state.global,
  );
  const { addresses } = useSelector((state: Models) => state.info);
  const getTopology = () => {
    dispatch({
      type: 'global/getTopology',
      payload: {
        url: debugApi,
      },
    });
  };
  useEffect(() => {
    dispatch({
      type: 'info/getAddresses',
      payload: {
        url: debugApi,
      },
    });
    getTopology();
    let timer = setInterval(getTopology, time);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className={styles.topology}>
        <Card
          title={'Connected Full Peers'}
          text={
            (topology?.connected || 0) + (topology?.bootNodes?.connected || 0)
          }
          style={{ minWidth: 525, marginRight: 50, marginBottom: 30 }}
        />
        <Card
          title={'Discovered Full Peers'}
          text={
            (topology?.population || 0) + (topology?.bootNodes?.connected || 0)
          }
          style={{ minWidth: 525, marginBottom: 30 }}
        />
      </div>
      <div className={`${styles.address} info_content`}>
        <div>
          NODE MODE:&nbsp;&nbsp;
          <span>
            {health?.bootNodeMode
              ? 'Boot Node'
              : health?.fullNode
              ? 'Full Node'
              : 'Light Node'}
          </span>
        </div>
        <div>
          AGENT VERSION:&nbsp;&nbsp;<span>{health?.version}</span>
        </div>
        <div>
          NETWORK ID:&nbsp;&nbsp;<span>{addresses?.network_id}</span>
        </div>
      </div>
      <div className={`${styles.address} info_content`}>
        <div>
          IPv4:&nbsp;&nbsp;
          <span>{addresses?.public_ip?.ipv4}</span>
        </div>
        <div>
          IPv6:&nbsp;&nbsp;
          <span>{addresses?.public_ip?.ipv6}</span>
        </div>
        <div>NAT ROUTE:</div>
        <ul className={styles.underlay}>
          {addresses?.nat_route?.map((item, index) => {
            return (
              <li className={styles.underlayList} key={index}>
                <span>{item}</span>
              </li>
            );
          })}
        </ul>
        <div>
          PUBLIC KEY:&nbsp;&nbsp;<span>{addresses?.public_key}</span>
        </div>
        <div>
          OVERLAY ADDRESS:&nbsp;&nbsp;
          <span>{addresses?.overlay}</span>
        </div>
        <div>UNDERLAY ADDRESS:</div>
        <ul className={styles.underlay}>
          {addresses?.underlay?.map((item, index) => {
            return (
              <li className={styles.underlayList} key={index}>
                <span>{item}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <Speed />
    </div>
  );
};

const Info: React.FC = (props) => {
  const { status } = useSelector((state: Models) => state.global);
  return <>{status ? <Main /> : <NotConnected />}</>;
};

export default Info;

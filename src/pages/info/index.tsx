import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
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
    <div className={styles.content}>
      <div style={{ display: 'flex' }}>
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
        <div className={`${styles.address}`} style={{ marginLeft: 50 }}>
          <div>
            <span className={styles.peers}>Connected Full Peers</span>
            <span className={styles.connected}>
              {(topology?.connected || 0) +
                (topology?.bootNodes?.connected || 0)}
            </span>
          </div>
          <div>
            <span className={styles.peers}>Discovered Full Peers</span>
            <span className={styles.connected}>
              {(topology?.population || 0) +
                (topology?.bootNodes?.connected || 0)}
            </span>
          </div>
        </div>
      </div>
      <div
        id={'address'}
        className={`${styles.address} info_content`}
        style={{ justifyContent: 'flex-start' }}
      >
        <div>
          IPv4:&nbsp;&nbsp;
          <span>{addresses?.public_ip?.ipv4}</span>
        </div>
        {addresses?.public_ip?.ipv6 && (
          <div>
            IPv6:&nbsp;&nbsp;
            <span>{addresses?.public_ip?.ipv6}</span>
          </div>
        )}
        <div>
          NAT ROUTE:&nbsp;&nbsp;
          {addresses?.nat_route?.map((item, index) => {
            return (
              <span key={index} style={{ marginRight: 20 }}>
                {item}
              </span>
            );
          })}
        </div>
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
      {addresses?.overlay && <Speed />}
    </div>
  );
};

const Info: React.FC = (props) => {
  const { status } = useSelector((state: Models) => state.global);
  return <>{status ? <Main /> : <NotConnected />}</>;
};

export default Info;

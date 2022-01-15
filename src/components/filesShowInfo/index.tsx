import React, { useEffect } from 'react';
import styles from './index.less';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import warningSvg from '@/assets/icon/warning.svg';
import classNames from 'classnames';

const FilesShowInfo: React.FC = () => {
  const dispatch = useDispatch();
  const { addresses } = useSelector((state: Models) => state.info);
  const { debugApi, health, topology } = useSelector(
    (state: Models) => state.global,
  );
  useEffect(() => {
    dispatch({
      type: 'info/getAddresses',
      payload: {
        url: debugApi,
      },
    });
    dispatch({
      type: 'global/getTopology',
      payload: {
        url: debugApi,
      },
    });
  }, []);
  return (
    <div
      className={classNames({
        [styles.content]: true,
        [styles.lightNode]: health?.bootNodeMode ? false : !health?.fullNode,
      })}
    >
      <div>
        <span className={styles.key}>Overlay Address</span>:&nbsp;&nbsp;
        <span className={styles.value}>{addresses?.overlay}</span>
      </div>
      <div>
        <span className={styles.key}>IPv4</span>:&nbsp;&nbsp;
        <span className={styles.value}>{addresses?.public_ip?.ipv4}</span>
      </div>
      {addresses?.public_ip?.ipv6 && (
        <div>
          <span className={styles.key}>IPv6</span>:&nbsp;&nbsp;
          <span className={styles.value}>{addresses?.public_ip?.ipv6}</span>
        </div>
      )}
      <div>
        <span className={styles.key}>Connected</span>:&nbsp;&nbsp;
        <span className={styles.value}>
          {(topology?.connected || 0) + (topology?.bootNodes?.connected || 0)}
        </span>
      </div>
      <div>
        <span className={styles.key}>Node Mode</span>:&nbsp;&nbsp;
        <span className={styles.value}>
          {health?.bootNodeMode
            ? 'Boot Node'
            : health?.fullNode
            ? 'Full Node'
            : 'Light Node'}
        </span>
      </div>
      {!health?.fullNode && (
        <div className={styles.tips}>
          <img alt="warning" src={warningSvg} style={{ width: 30 }} />
          <span className={styles.warning}>
            If the node mode is light, the file you upload here could not be
            downloaded by other nodes
          </span>
        </div>
      )}
    </div>
  );
};
export default FilesShowInfo;

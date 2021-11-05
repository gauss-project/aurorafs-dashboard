import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import warningSvg from '@/assets/icon/warning.svg';
import publicIp from 'public-ip';

const FilesShowInfo: React.FC = () => {
  const dispatch = useDispatch();
  const [ip, setIp] = useState('');
  const { debugApi, health, topology } = useSelector(
    (state: Models) => state.global,
  );
  useEffect(() => {
    publicIp.v4().then((res) => {
      setIp(res);
    });
    dispatch({
      type: 'info/getAddresses',
      payload: {
        url: debugApi,
      },
    });
  }, []);
  const { addresses } = useSelector((state: Models) => state.info);
  return (
    <div className={styles.content}>
      <div>
        <span className={styles.key}>Overlay Address</span>:&nbsp;&nbsp;
        <span className={styles.value}>{addresses?.overlay}</span>
      </div>
      <div>
        <span className={styles.key}>IP</span>:&nbsp;&nbsp;
        <span className={styles.value}>{ip}</span>
      </div>
      <div>
        <span className={styles.key}>Connected</span>:&nbsp;&nbsp;
        <span className={styles.value}>{topology?.connected || 0}</span>
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
      <div className={styles.tips}>
        <img alt="warning" src={warningSvg} style={{ width: 30 }} />
        <span className={styles.warning}>
          If the node mode is light, the file you upload here could not be
          downloaded by other nodes
        </span>
      </div>
    </div>
  );
};

export default FilesShowInfo;

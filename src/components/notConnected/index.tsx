import React from 'react';
import styles from './index.less';

const NotConnected: React.FC = () => {
  return (
    <>
      <div className={styles.notConnected}>
        <p>Looks like your node is not connected</p>
        <p>
          please check your API / DebugAPI{' '}
          <a href={'#/setting'} className={'mainColor'}>
            settings
          </a>
        </p>
      </div>
    </>
  );
};
export default NotConnected;

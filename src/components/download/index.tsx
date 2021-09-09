import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import styles from './index.less';
import { useSelector } from 'umi';
import { Models } from '@/declare/modelType';

const Download: React.FC = () => {
  const { api } = useSelector((state: Models) => state.global);
  const [hash, setHash] = useState('');
  const download = (): boolean | void => {
    if (!hash || hash.length !== 64) {
      message.info('Incorrect format of file hash');
      return false;
    }
    window.open(api + '/files/' + hash);
    setHash('')
  };
  return <div className={styles.downloadFile}>
    <div style={{ flex: 1 }}>
      <Input placeholder={'Please enter file hash'} onChange={(e) => {
        setHash(e.currentTarget.value);
      }} />
    </div>
    <Button
      type='primary'
      onClick={download}
      className={styles.download}
      value={hash}
    >
      download
    </Button>
  </div>;
};

export default Download;

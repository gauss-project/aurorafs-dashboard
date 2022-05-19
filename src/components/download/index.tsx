import React, { useState } from 'react';
import { Input, Button } from 'antd';
import styles from './index.less';
import { useSelector } from 'umi';
import { Models } from '@/declare/modelType';

const Download: React.FC = () => {
  const [hash, setHash] = useState('');
  const { api } = useSelector((state: Models) => state.global);

  const download = (hashValue: string): void => {
    hashValue = hashValue.trim();
    window.open(api + '/aurora/' + hashValue);
    setHash('');
  };
  return (
    <div className={styles.downloadFile}>
      <div style={{ flex: 1 }}>
        <Input
          placeholder={'Enter file hash'}
          value={hash}
          onChange={(e) => {
            setHash(e.currentTarget.value);
          }}
          onPressEnter={(e) => {
            if (hash) {
              download(hash);
            }
          }}
        />
      </div>
      <Button
        onClick={() => {
          download(hash);
        }}
        disabled={!hash}
        className={styles.download}
      >
        open
      </Button>
    </div>
  );
};

export default Download;

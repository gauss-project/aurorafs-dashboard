import React, { useEffect, useRef, useState } from 'react';
import { Input, Button, message } from 'antd';
import styles from './index.less';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';

const Download: React.FC = () => {
  let dispatch = useDispatch();
  const [hash, setHash] = useState('');
  const { api } = useSelector((state: Models) => state.global);
  const { filesList } = useSelector((state: Models) => state.files);

  const download = (hashValue: string): void => {
    hashValue = hashValue.trim();
    window.open(api + '/aurora/' + hashValue);
    if (filesList.findIndex((item) => item.rootCid === hashValue) === -1) {
      dispatch({
        type: 'files/addDLHash',
        payload: {
          hash: hashValue,
        },
      });
    }
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

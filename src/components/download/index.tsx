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
    window.open(api + '/aurora/' + hashValue);
    if (filesList.findIndex((item) => item.fileHash === hashValue) === -1) {
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
        />
      </div>
      <Button
        onClick={() => {
          download(hash);
        }}
        className={styles.download}
        disabled={!hash || hash.length !== 64}
      >
        open
      </Button>
    </div>
  );
};

export default Download;

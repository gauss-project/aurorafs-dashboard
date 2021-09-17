import React, { useEffect, useRef, useState } from 'react';
import { Input, Button, message } from 'antd';
import styles from './index.less';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import Api from '@/api/api';
import { stringToBinary } from '@/utils/util';

const Download: React.FC = () => {
  let dispatch = useDispatch();
  const [hash, setHash] = useState('');
  const { api } = useSelector((state: Models) => state.global);
  const { filesList, downloadList } = useSelector((state: Models) => state.files);
  // let timer = useRef<NodeJS.Timer | null>(null);
  // let count = useRef(0);
  // const getFilesList = (): void => {
  //   dispatch({
  //     type: 'files/getFilesList',
  //     payload: {
  //       url: api,
  //     },
  //   });
  // };
  const download = (hashValue: string): void => {
    window.open(api + '/files/' + hashValue);
    if (filesList.findIndex(item => item.fileHash === hashValue) === -1) {
      dispatch({
        type: 'files/addDLHash',
        payload: {
          hash: hashValue,
        },
      });
    }
    setHash('');
  };
  // useEffect(() => {
  //     let notFoundError = true;
  //     filesList.forEach((item, index) => {
  //       const i = downloadList.indexOf(item.fileHash);
  //       const status = !/0/.test(stringToBinary(item.bitVector.b, item.bitVector.len, item.size));
  //       if (i !== -1) {
  //         notFoundError = false;
  //         if (status) {
  //           setTimeout(() => {
  //             dispatch({
  //               type: 'files/deleteDLHash',
  //               payload: { hash: item.fileHash },
  //             });
  //           }, 2000);
  //         }
  //       }
  //       else if(!status){
  //           dispatch({
  //             type: 'files/addDLHash',
  //             payload: {
  //               downloadList: downloadList.concat(item.fileHash),
  //             },
  //           });
  //       }
  //     });
  //     if (downloadList.length && count.current >= 10 && notFoundError) {
  //       dispatch({
  //         type: 'files/setDownloadList',
  //         payload: { downloadList: [] },
  //       });
  //     }
  // }, [filesList]);
  // useEffect(() => {
  //   if (downloadList.length) {
  //     if (timer.current) clearInterval(timer.current);
  //     count.current = 0;
  //     timer.current = setInterval(() => {
  //       count.current++;
  //       getFilesList();
  //     }, 3000);
  //   } else if (!downloadList.length && timer.current) {
  //     clearInterval(timer.current);
  //     timer.current = null;
  //   }
  // }, [downloadList]);
  return <div className={styles.downloadFile}>
    <div style={{ flex: 1 }}>
      <Input placeholder={'Enter file hash'} value={hash} onChange={(e) => {
        setHash(e.currentTarget.value);
      }} />
    </div>
    <Button
      type='primary'
      onClick={() => {
        download(hash);
      }}
      className={styles.download}
      // disabled={!hash || hash.length !== 64}
    >
      download
    </Button>
  </div>;
};

export default Download;

import React, { useEffect, useRef } from 'react';
import styles from './index.less';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import NotConnected from '@/components/notConnected';
import FileUpload from '@/components/fileUpload';
import Download from '@/components/download';
import FilesList from '@/components/filesList';
import Loading from '@/components/loading';
import { stringToBinary } from '@/utils/util';
import { message } from 'antd';

import { FileType, PascalCasedProps } from '@/declare/api';

const Main: React.FC = (props) => {
  let dispatch = useDispatch();
  const { uploadStatus } = useSelector((state: Models) => state.files);
  const { api, ws } = useSelector((state: Models) => state.global);
  const { filesList } = useSelector((state: Models) => state.files);

  const subResult = useRef({
    rootCidStatus: {
      id: 31,
      result: '',
    },
    rootCidList: {
      id: 32,
      result: '',
    },
  }).current;

  const getFilesList = (): void => {
    dispatch({
      type: 'files/getFilesList',
      payload: {
        url: api,
      },
    });
  };

  const subStatus = () => {
    ws?.send(
      {
        id: subResult.rootCidStatus.id,
        jsonrpc: '2.0',
        method: 'chunkInfo_subscribe',
        params: ['rootCidStatus'],
      },
      (err, res) => {
        if (err || res?.error) {
          message.error(err || res?.error);
        }
        subResult.rootCidStatus.result = res?.result;
        ws?.on(res?.result, (res) => {
          getFilesList();
        });
      },
    );
  };

  const subDownloadProgress = (rootCidList: string[]) => {
    ws?.send(
      {
        id: subResult.rootCidList.id,
        jsonrpc: '2.0',
        method: 'chunkInfo_subscribe',
        params: ['downloadProgress', rootCidList],
      },
      (err, res) => {
        if (err && res?.error) {
          subDownloadProgress(rootCidList);
        } else {
          subResult.rootCidList.result = res?.result;
          ws?.on(res?.result, (res: PascalCasedProps<FileType>[]) => {
            // let newList = res;
            // let oldList = JSON.parse(JSON.stringify(filesList));
            // for (let i = 0; i < newList.length; i++) {
            //   for (let j = 0; j < oldList.length; j++) {
            //     if (oldList[j].rootCid === newList[i].RootCid) {
            //       oldList[j].bitVector = newList[i].Bitvector;
            //     }
            //   }
            // }
            let list = filesList.map((item) => {
              let data = res.find((i) => i.RootCid === item.rootCid);
              return {
                ...item,
                bitVector: data ? data.Bitvector : item.bitVector,
              };
            });
            dispatch({
              type: 'files/setFilesList',
              payload: {
                filesList: list,
              },
            });
          });
        }
      },
    );
  };

  const unSubDownloadProgress = () => {
    ws?.send(
      {
        id: subResult.rootCidList.id,
        jsonrpc: '2.0',
        method: 'chunkInfo_unsubscribe',
        params: [subResult.rootCidList.result],
      },
      (err, res) => {
        if (err || res?.error) {
          unSubDownloadProgress();
        } else {
          subResult.rootCidList.result = '';
        }
      },
    );
  };

  const observeProgress = () => {
    if (subResult.rootCidList.result) {
      unSubDownloadProgress();
    }
    if (filesList.length) {
      let rootCidList = filesList
        .filter((item) =>
          /0/.test(
            stringToBinary(item.bitVector.b, item.bitVector.len, item.size),
          ),
        )
        .map((item) => item.rootCid);

      if (rootCidList.length) {
        subDownloadProgress(rootCidList);
      }
    }
  };

  useEffect(() => {
    // filesList.forEach((item, index) => {
    //   const i = downloadList.indexOf(item.rootCid);
    //   const status = !/0/.test(
    //     stringToBinary(item.bitVector.b, item.bitVector.len, item.size),
    //   );
    //   if (i !== -1) {
    //     if (status) {
    //       setTimeout(() => {
    //         dispatch({
    //           type: 'files/deleteDLHash',
    //           payload: { hash: item.rootCid },
    //         });
    //       }, 2000);
    //     }
    //   } else if (!status) {
    //     dispatch({
    //       type: 'files/addDLHash',
    //       payload: {
    //         hash: item.rootCid,
    //       },
    //     });
    //   }
    // });
    observeProgress();
  }, [filesList]);

  const unSub = () => {
    Object.values(subResult).forEach((item) => {
      ws?.send(
        {
          id: item.id,
          jsonrpc: '2.0',
          method: 'chunkInfo_unsubscribe',
          params: [item.result],
        },
        (err, res) => {
          console.log(err, res);
        },
      );
    });
  };

  useEffect(() => {
    getFilesList();
    subStatus();
    return () => {
      // dispatch({
      //   type: 'files/setDownloadList',
      //   payload: {
      //     downloadList: [],
      //   },
      // });
      dispatch({
        type: 'files/initQueryData',
      });
      unSub();
    };
  }, []);
  return (
    <>
      <div className={styles.content}>
        <div>
          <Download />
        </div>
        <div style={{ marginTop: 30 }}>
          <FileUpload />
        </div>
        <div style={{ marginTop: 30 }}>
          <FilesList />
        </div>
        {uploadStatus && (
          <Loading text={'File uploading'} status={uploadStatus} />
        )}
      </div>
    </>
  );
};
const Files: React.FC = (props) => {
  const { status } = useSelector((state: Models) => state.global);
  return <>{status ? <Main /> : <NotConnected />}</>;
};
export default Files;

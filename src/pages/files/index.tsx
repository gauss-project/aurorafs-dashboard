import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import NotConnected from '@/components/notConnected';
import FileUpload from '@/components/fileUpload';
import Download from '@/components/download';
import FilesList from '@/components/filesList';
import Loading from '@/components/loading';
import { stringToBinary } from '@/utils/util';

const Main: React.FC = (props) => {
  let dispatch = useDispatch();
  const { uploadStatus } = useSelector((state: Models) => state.files);
  const { api } = useSelector((state: Models) => state.global);
  const { filesList, downloadList } = useSelector((state: Models) => state.files);
  let timer = useRef<NodeJS.Timer | null>(null);
  let count = useRef(0);
  const getFilesList = (): void => {
    dispatch({
      type: 'files/getFilesList',
      payload: {
        url: api,
      },
    });
  };

  useEffect(() => {
    let notFoundError = true;
    filesList.forEach((item, index) => {
      const i = downloadList.indexOf(item.fileHash);
      const status = !/0/.test(stringToBinary(item.bitVector.b, item.bitVector.len, item.size));
      if (i !== -1) {
        notFoundError = false;
        if (status) {
          setTimeout(() => {
            dispatch({
              type: 'files/deleteDLHash',
              payload: { hash: item.fileHash },
            });
          }, 2000);
        }
      } else if (!status) {
        dispatch({
          type: 'files/addDLHash',
          payload: {
            hash: item.fileHash,
          },
        });
      }
    });
    if (downloadList.length && count.current >= 10 && notFoundError) {
      dispatch({
        type: 'files/setDownloadList',
        payload: { downloadList: [] },
      });
    }
  }, [filesList]);
  useEffect(() => {
    if (downloadList.length) {
      if (timer.current) clearInterval(timer.current);
      count.current = 0;
      timer.current = setInterval(() => {
        count.current++;
        getFilesList();
      }, 3000);
    } else if (!downloadList.length && timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, [downloadList]);
  useEffect(() => {
    getFilesList();
    return () => {
      if (timer.current) clearInterval(timer.current);
      dispatch({
        type: 'files/setDownloadList',
        payload: {
          downloadList: [],
        },
      });
    };
  }, []);
  return <>
    <div>
      <div>
        <Download />
      </div>
      <div style={{ marginTop: 50 }}>
        <FileUpload />
      </div>
      <div style={{ marginTop: 50 }}>
        <FilesList />
      </div>
      {
        uploadStatus && <Loading text={'File uploading'} status={uploadStatus} />
      }
    </div>
  </>;
};
const Files: React.FC = (props) => {
  const { status } = useSelector((state: Models) => state.global);
  return <>
    {
      status ?
        <Main />
        :
        <NotConnected />
    }
  </>;
};
export default Files;

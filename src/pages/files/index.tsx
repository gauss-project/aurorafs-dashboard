import React from 'react';
import { useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import NotConnected from '@/components/notConnected';
import FileUpload from '@/components/fileUpload';
import Download from '@/components/download';
import FilesList from '@/components/filesList';
import Loading from '@/components/loading';

const Main: React.FC = (props) => {
  const { uploadStatus } = useSelector((state: Models) => state.files);
  return <>
    <div>
      <Download />
    </div>
    <div style={{ marginTop: 50 }}>
      <FileUpload />
    </div>
    <div style={{ marginTop: 50, width: 1200 }}>
      <FilesList />
    </div>
    {
      uploadStatus && <Loading text={'File uploading'} status={uploadStatus} />
    }
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

import React, { useEffect, useMemo, useState } from 'react';
import { Upload, Button, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import styles from './index.less';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';

import { UploadFile } from 'antd/es/upload/interface';

const { Dragger } = Upload;

const FileUpload: React.FC = () => {
  const dispatch = useDispatch();
  const { api } = useSelector((state: Models) => state.global);
  const [file, setFile] = useState<UploadFile | null>(null);
  const beforeUpload = (file: UploadFile): boolean => {
    setFile(file);
    return false;
  };
  const onRemove = (): void => {
    setFile(null);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    if (!e.dataTransfer.items[0].webkitGetAsEntry()?.isFile) {
      setFile(null);
      message.info('Do not upload folders');
    }
  };
  const upload = async (): Promise<void | boolean> => {
    dispatch({
      type: 'files/upload',
      payload: {
        url: api,
        file,
      },
    });
    setFile(null);
  };
  const fileList = useMemo(() => {
    return file ? [file] : [];
  }, [file]);
  return <div className={styles.fileUpload}>
    <div style={{ flex: 1 }}>
      <Dragger
        maxCount={1}
        beforeUpload={beforeUpload}
        onRemove={onRemove}
        listType={'picture'}
        fileList={fileList}
        onDrop={onDrop}
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>Click or drag file to this area to upload</p>
      </Dragger>
    </div>
    <Button
      className={styles.upload}
      type='primary'
      onClick={upload}
      disabled={!file}
    >
      upload
    </Button>
  </div>;
};

export default FileUpload;

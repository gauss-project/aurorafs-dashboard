import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import styles from './index.less';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';

// import { UploadFile } from 'antd/es/upload/interface';

const { Dragger } = Upload;

const FileUpload: React.FC = () => {
  const dispatch = useDispatch();
  const { api } = useSelector((state: Models) => state.global);
  const [file, setFile] = useState<File | null>(null);
  const beforeUpload = (file: File): boolean => {
    setFile(file);
    return false;
  };
  const onRemove = (): void => {
    setFile(null);
  };
  const upload = async (): Promise<void | boolean> => {
    if (!file || !file.type) {
      message.info('Please select the correct file');
      return false;
    }
    dispatch({
      type: 'files/upload',
      payload: {
        url: api,
        file,
      },
    });
  };
  return <div className={styles.fileUpload}>
    <div style={{ flex: 1 }}>
      <Dragger
        maxCount={1}
        beforeUpload={beforeUpload}
        onRemove={onRemove}
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
    >
      upload
    </Button>
  </div>;
};

export default FileUpload;

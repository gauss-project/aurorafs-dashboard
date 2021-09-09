import React from 'react';
import { Table, Tooltip, Popconfirm } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FileType } from '@/declare/api';
import styles from './index.less';
import Icon from '@ant-design/icons';
import pinSvg from '@/assets/icon/pin.svg';
import pinOffSvg from '@/assets/icon/Pin Off.svg';
import classNames from 'classnames';
import {
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import CopyText from '@/components/copyText';
import { useSelector } from 'umi';
import { Models } from '@/declare/modelType';

const FilesList: React.FC = () => {
  const { api } = useSelector((state: Models) => state.global);
  const { filesList } = useSelector((state: Models) => state.files);
  const pinOrUnPin = (hash: string, status: boolean): void => {
    console.log(hash, status);
  };
  const confirm = (): void => {

  };
  const columns: ColumnsType<FileType> = [
    {
      title: <div className={styles.head}>File Hash</div>,
      key: 'hash',
      render: (text, record) => <>
        <span style={{ marginRight: 5 }}>{record.hash}</span><CopyText text={record.hash} />
      </>,
    },
    {
      title: <div className={styles.head}>Size</div>,
      key: 'Size',
      dataIndex: 'size',
      align: 'center',
    },
    {
      title: <div className={styles.head}>Pin/UnPin</div>,
      key: 'pin',
      render: (text, record) =>
        <Tooltip placement='top' title={record.pin ? 'unpin the file' : 'pin the file'} arrowPointAtCenter>
          <img src={record.pin ? pinSvg : pinOffSvg} width={30} style={{ cursor: 'pointer' }} onClick={() => {
            pinOrUnPin(record.hash, record.pin);
          }} />
        </Tooltip>,
      align: 'center',
    },
    {
      title: <div className={styles.head}>Download Local</div>,
      key: 'local',
      render: (text) =>
        <a href={`${api}/files/${text.hash}`} target={'_blank'}>
          <DownloadOutlined style={{ fontSize: 25 }} />
        </a>
      ,
      align: 'center',
    },
    {
      title: <div className={styles.head}>Delete</div>,
      key: 'Delete',
      render: () =>
        <Popconfirm
          title='Are you sure to delete the file?'
          onConfirm={confirm}
          okText='Yes'
          cancelText='No'
        >
          <DeleteOutlined style={{ fontSize: 25, cursor: 'pointer' }} />
        </Popconfirm>,
      align: 'center',
    },
  ];
  return <div>
    <Table<FileType>
      className={styles.filesList}
      dataSource={filesList}
      columns={columns}
      rowKey={item => item.hash}
      pagination={false}
    />
  </div>;
};

export default FilesList;

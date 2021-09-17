import React, { useEffect, useMemo } from 'react';
import { Table, Tooltip, Popconfirm, Progress } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FileType } from '@/declare/api';
import styles from './index.less';
import pinSvg from '@/assets/icon/pin.svg';
import pinOffSvg from '@/assets/icon/Pin Off.svg';
import {
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import CopyText from '@/components/copyText';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import ChunkTooltip from '@/components/chunkTooltip';
import { getSize, stringToBinary, getProgress } from '@/utils/util';

const FilesList: React.FC = () => {
  const dispatch = useDispatch();
  const { api } = useSelector((state: Models) => state.global);
  const { filesList, downloadList } = useSelector((state: Models) => state.files);

  const pinOrUnPin = (hash: string, pinState: boolean): void => {
    dispatch({
      type: 'files/pinOrUnPin',
      payload: {
        url: api,
        hash,
        pinState,
      },
    });
  };
  // delete
  const confirm = (hash: string): void => {
    dispatch({
        type: 'files/deleteDLHash',
        payload: {
          hash,
        },
      });
    dispatch({
      type: 'files/deleteFile',
      payload: {
        url: api,
        hash,
      },
    });
  };
  // table field
  const columns: ColumnsType<FileType> = [
    {
      title: <div className={styles.head}>File Hash</div>,
      key: 'hash',
      render: (text, record) => <>
        <span style={{ marginRight: 5 }}>{record.fileHash}</span><CopyText text={record.fileHash} />
        {
          downloadList.indexOf(record.fileHash) !== -1 && <div style={{ width: '70%', display: 'flex' }}>
            <Progress percent={getProgress(record.bitVector.b)} showInfo={false} />
            <Tooltip placement='bottom' title={<ChunkTooltip chunk={record.bitVector.b} />} color='#fff' trigger='click'
                     arrowPointAtCenter overlayClassName={styles.chunkTooltip} overlayInnerStyle={{ minHeight: 0 }}>
              <div style={{ marginLeft: '10px', color: '#F59A23', cursor: 'default' }}>details</div>
            </Tooltip>
          </div>
        }
      </>,
    },
    {
      title: <div className={styles.head}>Size</div>,
      key: 'size',
      render: (text, record) => <span>{getSize((record.fileSize) * 256, 1)}</span>,
      align: 'center',
    },
    {
      title: <div className={styles.head}>Pin/UnPin</div>,
      key: 'pin',
      render: (text, record) =>
        <Tooltip placement='top' title={record.pinState ? 'unpin the file' : 'pin the file'} arrowPointAtCenter>
          <img src={record.pinState ? pinSvg : pinOffSvg} width={25} style={{ cursor: 'pointer' }} onClick={() => {
            pinOrUnPin(record.fileHash, record.pinState);
          }} />
        </Tooltip>,
      align: 'center',
    },
    {
      title: <div className={styles.head}>Download</div>,
      key: 'local',
      render: (text, record) =>
        <a href={`${api}/files/${record.fileHash}`} target={'_blank'}>
          <DownloadOutlined style={{ fontSize: 25 }} />
        </a>
      ,
      align: 'center',
    },
    {
      title: <div className={styles.head}>Delete</div>,
      key: 'Delete',
      render: (text, record) =>
        <Popconfirm
          title='Are you sure to delete the file?'
          onConfirm={() => {
            confirm(record.fileHash);
          }}
          okText='Yes'
          cancelText='No'
        >
          <DeleteOutlined style={{ fontSize: 25, cursor: 'pointer' }} />
        </Popconfirm>,
      align: 'center',
    },
  ];
  // table data
  const reFilesList = useMemo(() => {
    return filesList.map(item => ({
      ...item,
      bitVector: {
        ...item.bitVector,
        b: stringToBinary(item.bitVector.b, item.bitVector.len, item.size),
      },
    }));
  }, [filesList]);
  return <div>
    <Table<FileType>
      className={styles.filesList}
      dataSource={reFilesList}
      columns={columns}
      rowKey={item => item.fileHash}
      pagination={false}
      locale={{ emptyText: 'No Data' }}
    />
  </div>;
};

export default FilesList;

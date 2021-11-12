import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tooltip, Popconfirm, Progress, Modal } from 'antd';

const { confirm } = Modal;
import { ColumnsType } from 'antd/es/table';
import { AllFileInfo } from '@/declare/api';
import styles from './index.less';
import {
  DeleteOutlined,
  FolderOpenOutlined,
  ExclamationCircleOutlined,
  VerticalAlignBottomOutlined,
  ToTopOutlined,
} from '@ant-design/icons';
import CopyText from '@/components/copyText';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import ChunkTooltip from '@/components/chunkTooltip';
import { getSize, stringToBinary, getProgress } from '@/utils/util';

import pinSvg from '@/assets/icon/pin.svg';
import unPinSvg from '@/assets/icon/unPin.svg';
import { downloadFile } from '@/api/api';
import Popup from '@/components/popup';
import SourceInfo from '@/components/sourceInfo';

const FilesList: React.FC = () => {
  const dispatch = useDispatch();
  const { api, metrics } = useSelector((state: Models) => state.global);
  const { filesList, downloadList, filesInfo } = useSelector(
    (state: Models) => state.files,
  );

  const [hashInfo, setHashInfo] = useState<AllFileInfo | null>(null);

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
  const confirmDelete = (hash: string): void => {
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

  const clickHandle = (hashInfo: AllFileInfo): void => {
    setHashInfo(hashInfo);
  };
  // table field
  const columns: ColumnsType<AllFileInfo> = [
    {
      title: <div className={styles.head}>File</div>,
      key: 'hash',
      render: (text, record) => (
        <>
          <div style={{ fontSize: 16 }}>
            {(record.name?.length as number) > 20
              ? record.name?.substr(0, 20) + '...'
              : record.name}
          </div>
          <span style={{ marginRight: 5, color: '#666' }}>
            {record.fileHash}
          </span>
          <CopyText text={record.fileHash} />{' '}
          <ExclamationCircleOutlined
            style={{ cursor: 'pointer' }}
            onClick={() => {
              clickHandle(record);
            }}
          />
          {downloadList.indexOf(record.fileHash) !== -1 && (
            <div style={{ width: '70%', display: 'flex' }}>
              <Progress
                percent={getProgress(record.bitVector.b)}
                showInfo={false}
              />
            </div>
          )}
        </>
      ),
      width: 600,
    },
    {
      title: <div className={styles.head}>Size</div>,
      key: 'size',
      render: (text, record) => (
        <span style={{ fontSize: 16 }}>
          {record.manifestSize
            ? getSize(record.manifestSize, 0)
            : getSize(record.fileSize * 256, 1)}
        </span>
      ),
    },
    {
      title: <div className={styles.head}>Pin/UnPin</div>,
      key: 'pin',
      render: (text, record) => (
        <>
          {/0/.test(record.bitVector.b) || (
            <Tooltip
              placement="top"
              title={record.pinState ? 'unpin the file' : 'pin the file'}
              arrowPointAtCenter
            >
              <img
                src={record.pinState ? pinSvg : unPinSvg}
                width={25}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  pinOrUnPin(record.fileHash, record.pinState);
                }}
              />
            </Tooltip>
          )}
        </>
      ),
      align: 'center',
    },
    {
      title: <div className={styles.head}>Open</div>,
      key: 'open',
      render: (text, record) => (
        <div
          onClick={() => {
            if (record.isM3u8) {
              window.open(`#/video/${record.fileHash}`);
            } else {
              window.open(`${api}/aurora/${record.fileHash}`);
            }
          }}
        >
          <FolderOpenOutlined className={'mainColor iconSize'} />
        </div>
      ),
      align: 'center',
    },
    {
      title: <div className={styles.head}>Delete</div>,
      key: 'Delete',
      render: (text, record) => (
        <>
          <DeleteOutlined
            className={'mainColor iconSize'}
            onClick={() => {
              confirm({
                title: 'Are you sure to delete the file?',
                okText: 'Yes',
                okType: 'danger',
                icon: <></>,
                maskClosable: true,
                // centered:true,
                cancelText: 'No',
                onOk() {
                  confirmDelete(record.fileHash);
                },
              });
            }}
          />
        </>
      ),
      align: 'center',
    },
  ];
  // Table Data
  const data: AllFileInfo[] = useMemo(() => {
    return filesList.map((item) => {
      return {
        ...item,
        ...filesInfo[item.fileHash],
        bitVector: {
          ...item.bitVector,
          b: stringToBinary(item.bitVector.b, item.bitVector.len, item.size),
        },
      };
    });
  }, [filesList, filesInfo]);
  return (
    <div>
      <div style={{ fontSize: 20 }}>
        <span>
          <VerticalAlignBottomOutlined />{' '}
          {getSize(metrics.downloadSpeed * 256 * 1024, 0)}/s
        </span>
        <span style={{ marginLeft: 20 }}>
          <ToTopOutlined /> {getSize(metrics.uploadSpeed * 256 * 1024, 0)}/s
        </span>
      </div>
      <Table<AllFileInfo>
        className={styles.filesList}
        dataSource={data}
        columns={columns}
        rowKey={(item) => item.fileHash}
        pagination={false}
        locale={{ emptyText: 'No Data' }}
        scroll={filesList.length > 7 ? { y: 560 } : {}}
      />
      <Popup
        visible={!!hashInfo}
        onCancel={() => {
          setHashInfo(null);
        }}
        title={
          <>
            <div style={{ fontSize: 16 }}>
              {(hashInfo?.name?.length as number) > 20
                ? hashInfo?.name?.substr(0, 20) + '...'
                : hashInfo?.name}
            </div>
            <span style={{ marginRight: 5, color: '#666' }}>
              {hashInfo?.fileHash}
            </span>
          </>
        }
      >
        {hashInfo && <SourceInfo hashInfo={hashInfo} />}
      </Popup>
    </div>
  );
};

export default FilesList;

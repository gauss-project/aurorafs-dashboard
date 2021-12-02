import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table, Tooltip, Popconfirm, Progress, Modal } from 'antd';

const { confirm } = Modal;
import { ColumnsType } from 'antd/es/table';
import { AllFileInfo } from '@/declare/api';
import styles from './index.less';
import {
  DeleteOutlined,
  FolderOpenOutlined,
  ExclamationCircleOutlined,
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
  const ref = useRef<HTMLDivElement | null>(null);

  const { api } = useSelector((state: Models) => state.global);
  const { filesList, downloadList, filesInfo } = useSelector(
    (state: Models) => state.files,
  );

  const [hashInfo, setHashInfo] = useState<AllFileInfo | null>(null);

  const [top, setTop] = useState(0);

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
          <div style={{ fontSize: 16 }} className={styles.fileName}>
            {record.name}
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
            className={'mainColor'}
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
                title: (
                  <div className={'info_content'}>
                    <div style={{ marginBottom: 10 }}>
                      Are you sure to delete the file?
                    </div>
                    <div className={styles.name}>
                      FileName:&nbsp;&nbsp;<span>{record.name}</span>
                    </div>
                    RCID:&nbsp;&nbsp;<span>{record?.fileHash}</span>
                  </div>
                ),
                okText: 'Yes',
                okType: 'danger',
                icon: <></>,
                maskClosable: true,
                centered: true,
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
  useEffect(() => {
    setTop(
      document
        .getElementsByClassName('ant-table-tbody')[0]
        .getBoundingClientRect().top,
    );
  }, []);
  const scrollY = useMemo(() => {
    let h = document.body.clientHeight - top - 30;
    if (h < 200) return 200;
    return h;
  }, [document.body.clientHeight, top]);
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
    <div ref={ref}>
      <Table<AllFileInfo>
        className={styles.filesList}
        dataSource={data}
        columns={columns}
        rowKey={(item) => item.fileHash}
        pagination={false}
        locale={{ emptyText: 'No Data' }}
        scroll={data.length > scrollY / 80 ? { y: scrollY } : {}}
      />
      <Popup
        visible={!!hashInfo}
        onCancel={() => {
          setHashInfo(null);
        }}
        title={
          <>
            <div className={'info_content'}>
              <div className={styles.name}>
                FileName:&nbsp;&nbsp;<span>{hashInfo?.name}</span>
              </div>
              RCID:&nbsp;&nbsp;<span>{hashInfo?.fileHash}</span>
            </div>
          </>
        }
      >
        {hashInfo && <SourceInfo hashInfo={hashInfo} />}
      </Popup>
    </div>
  );
};

export default FilesList;

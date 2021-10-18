import React, { useEffect, useMemo } from 'react';
import { Table, Tooltip, Popconfirm, Progress, Modal } from 'antd';

const { confirm } = Modal;
import { ColumnsType } from 'antd/es/table';
import { AllFileInfo } from '@/declare/api';
import styles from './index.less';
import {
  DownloadOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import CopyText from '@/components/copyText';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import ChunkTooltip from '@/components/chunkTooltip';
import { getSize, stringToBinary, getProgress } from '@/utils/util';

import pinSvg from '@/assets/icon/pin.svg';
import unPinSvg from '@/assets/icon/unPin.svg';
import { downloadFile } from '@/api/api';

const FilesList: React.FC = () => {
  const dispatch = useDispatch();
  const { api } = useSelector((state: Models) => state.global);
  const { filesList, downloadList, filesInfo } = useSelector(
    (state: Models) => state.files,
  );

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
  // table field
  const columns: ColumnsType<AllFileInfo> = [
    {
      title: <div className={styles.head}>File</div>,
      key: 'hash',
      render: (text, record) => (
        <>
          <div
            style={{
              fontSize: 20,
              // fontWeight: 600,
            }}
          >
            {(record.name?.length as number) > 20
              ? record.name?.substr(0, 20) + '...'
              : record.name}
          </div>
          <span style={{ marginRight: 5, color: '#666' }}>
            {record.fileHash}
          </span>
          <CopyText text={record.fileHash} />
          {downloadList.indexOf(record.fileHash) !== -1 && (
            <div style={{ width: '70%', display: 'flex' }}>
              <Progress
                percent={getProgress(record.bitVector.b)}
                showInfo={false}
              />
              <Tooltip
                placement="bottom"
                title={<ChunkTooltip chunk={record.bitVector.b} />}
                color="#fff"
                trigger="click"
                arrowPointAtCenter
                overlayClassName={styles.chunkTooltip}
                overlayInnerStyle={{ minHeight: 0 }}
              >
                <div
                  style={{
                    marginLeft: '10px',
                    color: '#F59A23',
                    cursor: 'default',
                  }}
                >
                  details
                </div>
              </Tooltip>
            </div>
          )}
        </>
      ),
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
      align: 'center',
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
    // {
    //  title: <div className={styles.head}>Download</div>,
    //  key: 'local',
    //   render: (text, record) => <>
    //     {
    //       !record.sub && <div onClick={async () => {
    //         const data = await downloadFile(api, record.fileHash);
    //         let link = document.createElement('a');
    //         link.download = window.decodeURI(data.headers['content-disposition'].split('=')[1].slice(1, -1));
    //         link.href = URL.createObjectURL(new Blob([data.data], { type: data.data.type }));
    //         document.body.appendChild(link);
    //         link.click();
    //         URL.revokeObjectURL(link.href);
    //       }}>
    //         <DownloadOutlined className={"mainColor iconSize"} />
    //       </div>
    //     }
    //   </>
    //   ,
    //   align: 'center',
    // },
    {
      title: <div className={styles.head}>Open</div>,
      key: 'open',
      render: (text, record) => (
        <div
          onClick={() => {
            if (record.isM3u8) {
              window.open(`#/video/${record.fileHash}`);
            } else if (record.sub) {
              window.open(`${api}/aurora/${record.fileHash}`);
            } else {
              window.open(`${api}/files/${record.fileHash}`);
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
  // table data
  const reFilesList = useMemo(() => {
    return filesList.map((item) => ({
      ...item,
      bitVector: {
        ...item.bitVector,
        b: stringToBinary(item.bitVector.b, item.bitVector.len, item.size),
      },
    }));
  }, [filesList]);

  const data: AllFileInfo[] = useMemo(() => {
    return reFilesList.map((item) => {
      return { ...item, ...filesInfo[item.fileHash] };
    });
  }, [reFilesList, filesInfo]);
  return (
    <div>
      <Table<AllFileInfo>
        className={styles.filesList}
        dataSource={data}
        columns={columns}
        rowKey={(item) => item.fileHash}
        pagination={false}
        locale={{ emptyText: 'No Data' }}
      />
    </div>
  );
};

export default FilesList;

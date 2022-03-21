import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table, Tooltip, Popconfirm, Progress, Modal, message } from 'antd';

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
import { getSize, stringToBinary, getProgress } from '@/utils/util';

import pinSvg from '@/assets/icon/pin.svg';
import unPinSvg from '@/assets/icon/unPin.svg';
import regSvg from '@/assets/icon/reg.svg';
import unRegSvg from '@/assets/icon/unReg.svg';
import Popup from '@/components/popup';
import SourceInfo from '@/components/sourceInfo';
import { updateFileRegister } from '@/api/api';
import { mapQueryM3u8 } from '@/utils/util';
import Loading from '@/components/loading';
import { ethers } from 'ethers';

const FilesList: React.FC = () => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement | null>(null);

  const { api } = useSelector((state: Models) => state.global);
  const { filesList, downloadList } = useSelector(
    (state: Models) => state.files,
  );

  const [hashInfo, setHashInfo] = useState<AllFileInfo | null>(null);

  const [loading, setLoading] = useState(false);
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
  const registerHandle = async (overlay: string, status: boolean) => {
    try {
      setLoading(true);
      const { data } = await updateFileRegister(api, overlay, status);
      const provider = new ethers.providers.JsonRpcProvider(api + '/chain');
      let lock = false;
      let timer = setInterval(async () => {
        if (lock) return;
        lock = true;
        const res = await provider.getTransactionReceipt(data.hash);
        lock = false;
        if (res) {
          clearInterval(timer);
          setLoading(false);
          if (res.status) {
            dispatch({
              type: 'files/getFilesList',
              payload: {
                url: api,
              },
            });
            message.success('success');
          } else {
            message.error('Failure');
          }
        }
      }, 1000);
    } catch (e) {
      setLoading(false);
      if (e instanceof Error) message.error(e.message);
    }
  };
  // table field
  const columns: ColumnsType<AllFileInfo> = [
    {
      title: <div className={styles.head}>File</div>,
      key: 'hash',
      render: (text, record) => (
        <>
          <div style={{ fontSize: 16 }} className={styles.fileName}>
            {record.manifest.name}
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
      width: 650,
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
      width: 100,
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
                alt={'pinStatus'}
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
      width: 150,
    },
    {
      title: <div className={styles.head}>Register</div>,
      render: (text, record) => (
        <>
          {/0/.test(record.bitVector.b) || (
            <Tooltip
              placement="top"
              title={record.register ? 'Unregister' : 'Register'}
              arrowPointAtCenter
            >
              <img
                alt={'register'}
                src={record.register ? regSvg : unRegSvg}
                width={30}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  registerHandle(record.fileHash, !record.register);
                }}
              />
            </Tooltip>
          )}
        </>
      ),
      align: 'center',
      width: 100,
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
      width: 100,
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
                      FileName:&nbsp;&nbsp;<span>{record.manifest.name}</span>
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
      width: 100,
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
        bitVector: {
          ...item.bitVector,
          b: stringToBinary(item.bitVector.b, item.bitVector.len, item.size),
        },
        isM3u8: item.manifest.sub ? mapQueryM3u8(item.manifest.sub) : false,
        manifestSize: item.manifest.sub
          ? Object.values(item.manifest.sub).reduce((total, item: any) => {
              return total + item.size;
            }, 0)
          : item.size * 256 * 1024,
      };
    });
  }, [filesList]);
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
                FileName:&nbsp;&nbsp;<span>{hashInfo?.manifest.name}</span>
              </div>
              RCID:&nbsp;&nbsp;<span>{hashInfo?.fileHash}</span>
            </div>
          </>
        }
      >
        {hashInfo && <SourceInfo hashInfo={hashInfo} />}
      </Popup>
      {loading && <Loading text={'Loading'} status={loading} />}
    </div>
  );
};

export default FilesList;

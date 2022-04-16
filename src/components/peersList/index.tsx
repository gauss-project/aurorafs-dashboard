import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'umi';
import { Table, Button, Modal } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Peers, Peer } from '@/declare/api';
import styles from './index.less';
import moment from 'moment';

export interface Props {
  peers: Peers;
  isBlockList: boolean
}

const PeersList: React.FC<Props> = (props) => {
  const [top, setTop] = useState(0);
  const [peerInfo, setPeerInfo] = useState({});
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const columns: ColumnsType<Peer> = [
    {
      title: <div className={styles.head}>Index</div>,
      key: 'Index',
      render: (text, record, index) => index + 1,
      width: 100,
    },
    {
      title: <div className={styles.head}>Peer Id</div>,
      key: 'Peer ID',
      dataIndex: 'address',
    },
  ];

  const addColumnForBlock = () => {
    columns.push({
      title: <div className={styles.head}>Expiration Date</div>,
      key: 'Expiration time',
      render: (value, record, index) => {
        return (moment(record.timestamp).add(record.duration * 1000).format('MMMM Do YYYY, HH:mm:ss'))
      }
    },{
      title: 'Remove From List',
      render: (value, record, index) => {
        return (
          <div>
            <Button
              onClick={() => {
                setPeerInfo(record);
                setVisible(true);
              }}
            >
              remove
            </Button>
          </div>
        );
      },
      align: 'center',
      width: 180,
    })
  }

  const addColumnForNotBlock = () => {
    columns.push(
      {
        title: <div className={styles.head}>Direction</div>,
        key: 'Direction',
        dataIndex: 'direction',
        width: 100,
      },
      {
        title: 'Add to Block List',
        render: (value, record, index) => {
          return (
            <div>
              <Button
                onClick={() => {
                  setPeerInfo(record);
                  setVisible(true);
                }}
              >
                block
              </Button>
            </div>
          );
        },
        align: 'center',
        width: 150,
      }
    )
  }

  const addBlock = () => {
    setVisible(false);
    dispatch({
      type: 'peers/addBlock',
      payload: peerInfo
    })
  }

  const deleteBlock = () => {
    setVisible(false);
    dispatch({
      type: 'peers/deleteBlock',
      payload: peerInfo
    })
  }

  if (props.isBlockList) {
    addColumnForBlock();
  } else {
    addColumnForNotBlock();
  }

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
  return (
    <div ref={ref}>
      <Table<Peer>
        className={styles.peersList}
        dataSource={props.peers}
        columns={columns}
        rowKey={(item) => item.address}
        pagination={false}
        locale={{ emptyText: 'No Data' }}
        scroll={props.peers.length > scrollY / 55 ? { y: scrollY } : {}}
      />
      <Modal
        title={props.isBlockList ? 'remove' : 'block'}
        centered
        visible={visible}
        onOk={(e) => {
          props.isBlockList ? deleteBlock() : addBlock();
        }}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <div>Are you sure to {props.isBlockList ? 'remove' : 'block'}?</div>
      </Modal>
    </div>
  );
};

export default PeersList;

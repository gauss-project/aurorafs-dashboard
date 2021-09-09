import React from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Peers, Peer } from '@/declare/api';
import styles from './index.less';

export interface Props {
  peers: Peers;
}


const PeersList: React.FC<Props> = (props) => {
  const columns: ColumnsType<Peer> = [
    {
      title: <div className={styles.head}>Index</div>,
      key: 'Index',
      render: (text, record, index) => index + 1,
      width:150
    },
    {
      title: <div className={styles.head}>Peer Id</div>,
      key: 'Peer ID',
      dataIndex: 'address',
    },
  ];
  return <div>
    <Table<Peer>
      className={styles.peersList}
      dataSource={props.peers}
      columns={columns}
      rowKey={item => item.address}
      pagination={false}
    />
  </div>;
};

export default PeersList;

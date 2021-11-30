import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Peers, Peer } from '@/declare/api';
import styles from './index.less';

export interface Props {
  peers: Peers;
}

const PeersList: React.FC<Props> = (props) => {
  const [top, setTop] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const columns: ColumnsType<Peer> = [
    {
      title: <div className={styles.head}>Index</div>,
      key: 'Index',
      render: (text, record, index) => index + 1,
      width: 150,
    },
    {
      title: <div className={styles.head}>Peer Id</div>,
      key: 'Peer ID',
      dataIndex: 'address',
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
    </div>
  );
};

export default PeersList;

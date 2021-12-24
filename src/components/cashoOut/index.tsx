import React, { useState } from 'react';
import styles from './index.less';
import { Button, Table, Modal } from 'antd';

const { confirm } = Modal;
import { ColumnsType } from 'antd/es/table';
import { Cheque } from '@/declare/api';
import { trafficToBalance } from '@/utils/util';

type Props = {
  data: Cheque[];
  cashOut: Function;
  visible: boolean;
  setVisible: Function;
};

const CashOut: React.FC<Props> = (props) => {
  const { data, cashOut, visible, setVisible } = props;
  const clickHandle = (overlay: string): void => {
    cashOut(overlay);
    setVisible(false);
  };
  const columns: ColumnsType<Cheque> = [
    {
      title: 'Peers',
      dataIndex: 'peer',
      width: 600,
    },
    {
      title: 'Outstanding\nBalance',
      render: (value, record, index) => {
        return trafficToBalance(record.outstandingTraffic);
      },
      align: 'center',
      width: 150,
    },
    {
      title: 'Settlements\nSent/Received',
      render: (value, record, index) => {
        return (
          <div style={{ textAlign: 'left' }}>
            <div style={{ paddingLeft: 15 }}>
              {trafficToBalance(record.sendTraffic)}&nbsp;&nbsp;/
            </div>
            <div style={{ paddingLeft: 15 }}>
              {trafficToBalance(record.receivedTraffic)}
            </div>
          </div>
        );
      },
      align: 'center',
      width: 150,
    },
    {
      title: 'Total',
      render: (value, record, index) => {
        return trafficToBalance(record.total);
      },
      align: 'center',
      width: 150,
    },
    {
      title: 'Uncashed\nAmount',
      render: (value, record, index) => {
        return trafficToBalance(record.unCashed);
      },
      align: 'center',
      width: 150,
    },
    {
      title: 'cashout',
      render: (value, record, index) => {
        return (
          <div>
            {record.unCashed ? (
              <>
                <Button
                  onClick={() => {
                    setVisible(true);
                  }}
                >
                  cashout
                </Button>
                <Modal
                  title="Title"
                  centered
                  visible={visible}
                  onOk={() => {
                    clickHandle(record.peer);
                  }}
                  onCancel={() => {
                    setVisible(false);
                  }}
                >
                  <div>Are you sure to cashout the coin?</div>
                </Modal>
              </>
            ) : (
              <></>
            )}
          </div>
        );
      },
      align: 'center',
      width: 150,
    },
  ];
  return (
    <Table<Cheque>
      className={styles.list}
      dataSource={data}
      columns={columns}
      pagination={false}
      rowKey={(item) => item.peer}
      locale={{ emptyText: 'No Data' }}
    />
  );
};

export default CashOut;

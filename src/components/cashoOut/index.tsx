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
  confirmLoading: boolean;
  setConfirmLoading: Function;
};

const CashOut: React.FC<Props> = (props) => {
  const {
    data,
    cashOut,
    visible,
    setVisible,
    confirmLoading,
    setConfirmLoading,
  } = props;
  const clickHandle = (overlay: string): void => {
    cashOut(overlay);
  };
  const columns: ColumnsType<Cheque> = [
    {
      title: 'Peers',
      dataIndex: 'peer',
      width: 550,
    },
    {
      title: (
        <>
          <div>Outstanding</div>
          <div>Balance</div>
        </>
      ),
      render: (value, record, index) => {
        return trafficToBalance(record.outstandingTraffic);
      },
      align: 'center',
    },
    {
      title: (
        <>
          <div>Settlements</div>
          <div>Sent/Received</div>
        </>
      ),
      render: (value, record, index) => {
        return (
          <div style={{ textAlign: 'left', position: 'relative', left: 15 }}>
            <div>
              <span>-</span>
              {trafficToBalance(record.sentSettlements)}&nbsp;/
            </div>
            <div>{trafficToBalance(record.receivedSettlements)}</div>
          </div>
        );
      },
      align: 'center',
    },
    {
      title: 'Total',
      render: (value, record, index) => {
        return trafficToBalance(record.total);
      },
      align: 'center',
    },
    {
      title: (
        <>
          <div>Uncashed</div>
          <div>Amount</div>
        </>
      ),
      render: (value, record, index) => {
        return trafficToBalance(record.unCashed);
      },
      align: 'center',
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
                  title="cashout"
                  centered
                  visible={visible}
                  confirmLoading={confirmLoading}
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
      width: 120,
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

import React, { useRef, useState } from 'react';
import styles from './index.less';
import { Button, Table, Modal } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Cheque } from '@/declare/api';
import { trafficToBalance } from '@/utils/util';

type Props = {
  data: Cheque[];
  cashOut: Function;
  cashOutAll: Function;
};

const CashOut: React.FC<Props> = (props) => {
  const { data, cashOut, cashOutAll } = props;
  let overlay = useRef('');

  const [visible, setVisible] = useState(false);
  const [isAll, setIsAll] = useState(false);

  const clickHandle = (overlay: string): void => {
    setVisible(false);
    cashOut(overlay);
  };

  const clickAllHandle = () => {
    let arr = data
      .filter((item) => item.unCashed > 0 && item.status === 0)
      .map((item) => item.peer);
    setVisible(false);
    cashOutAll(arr);
  };

  const clickAllBtn = () => {
    setVisible(true);
    setIsAll(true);
  };

  const columns: ColumnsType<Cheque> = [
    {
      title: <div className={styles.head}>Index</div>,
      key: 'Index',
      render: (text, record, index) => index + 1,
      width: 50,
    },
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
            {record.unCashed && record.status === 0 ? (
              <>
                <Button
                  onClick={() => {
                    overlay.current = record.peer;
                    setVisible(true);
                  }}
                >
                  cashout
                </Button>
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
    <>
      <div style={{ textAlign: 'right', marginBottom: 10 }}>
        <Button onClick={clickAllBtn}>cashout_all</Button>
      </div>
      <Table<Cheque>
        className={styles.list}
        dataSource={data}
        columns={columns}
        pagination={false}
        rowKey={(item) => item.peer}
        locale={{ emptyText: 'No Data' }}
      />
      <Modal
        title="cashout"
        centered
        visible={visible}
        onOk={(e) => {
          isAll ? clickAllHandle() : clickHandle(overlay.current);
        }}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <div>Are you sure to cashout {isAll ? 'all' : ''} the coin?</div>
      </Modal>
    </>
  );
};

export default CashOut;

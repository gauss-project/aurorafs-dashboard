import React, { useEffect, useState } from 'react';
import styles from './index.less';
import NotConnected from '@/components/notConnected';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';

import CopyText from '@/components/copyText';
import CashOut from '@/components/cashoOut';
import { trafficToBalance } from '@/utils/util';
import { ethers } from 'ethers';
import { Modal, Button, Space, message } from 'antd';
import debugApi, { getKey } from '@/api/debugApi';
import QRCode from 'qrcode.react';

const Main: React.FC = () => {
  const dispatch = useDispatch();
  const [balance, setBalance] = useState('');
  const { api, debugApi } = useSelector((state: Models) => state.global);
  const { account, trafficInfo, trafficCheques } = useSelector(
    (state: Models) => state.accounting,
  );
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const getData = async () => {
    const provider = new ethers.providers.JsonRpcProvider(api + '/chain');
    const accounts = await provider.listAccounts();
    const account = accounts[0];
    dispatch({
      type: 'accounting/setAccount',
      payload: {
        account,
      },
    });
    const balance = await provider.getBalance(account);
    const bnb = ethers.utils.formatEther(balance);
    setBalance(bnb);
  };
  useEffect(() => {
    getData();
    dispatch({
      type: 'accounting/getTrafficInfo',
      payload: {
        url: api,
      },
    });
    dispatch({
      type: 'accounting/getTrafficCheques',
      payload: {
        url: api,
      },
    });
  }, []);
  const cashOut = (overlay: string): void => {
    setConfirmLoading(true);
    dispatch({
      type: 'accounting/cashOut',
      payload: {
        url: api,
        overlay,
      },
      callback: (err: boolean = false) => {
        if (err) {
          setConfirmLoading(false);
          setVisible(false);
        } else {
          setTimeout(() => {
            dispatch({
              type: 'accounting/getTrafficInfo',
              payload: {
                url: api,
              },
            });
            dispatch({
              type: 'accounting/getTrafficCheques',
              payload: {
                url: api,
              },
            });
            message.success('cashout successful');
            setConfirmLoading(false);
            setVisible(false);
          }, 10 * 1000);
        }
      },
    });
  };
  const getPrivateKey = async (): Promise<void> => {
    const { data } = await getKey(debugApi);
    const key = data.private_key;
    Modal.info({
      centered: true,
      icon: <></>,
      closable: true,
      okButtonProps: { style: { display: 'none' } },
      style: {
        height: 'auto',
      },
      content: (
        <div>
          <div style={{ textAlign: 'center' }}>
            <QRCode value={key} />,
          </div>
          <div className={styles.key}>
            <span className={'greyColor'} style={{ marginRight: 5 }}>
              {key}
            </span>
            <CopyText text={key} />
          </div>
        </div>
      ),
    });
  };
  return (
    <>
      <div>
        <div className={styles.head}>Chequebook</div>
        <div className={styles.balanceInfo}>
          <div className={styles.card} style={{ width: 250 }}>
            <div className={styles.title}>Total Balance</div>
            <div className={styles.balance}>
              {trafficToBalance(trafficInfo.balance)}
            </div>
          </div>
          <div className={styles.card} style={{ width: 300 }}>
            <div className={styles.title}>Available Uncommitted Balance</div>
            <div className={styles.balance}>
              {trafficToBalance(trafficInfo.availableBalance)}
            </div>
          </div>
          <div className={styles.card} style={{ width: 350 }}>
            <div className={styles.title}>Total Sent / Received</div>
            <div className={styles.balance}>
              {trafficToBalance(trafficInfo.totalSendTraffic)}&nbsp;/&nbsp;
              {trafficToBalance(trafficInfo.receivedTraffic)}
            </div>
          </div>
          <div className={styles.card} style={{ width: 200 }}>
            <div className={styles.title}>BNB Testnet Balance</div>
            <div className={styles.balance}>
              {balance ? balance : <div className={'loading'} />}
            </div>
            <a
              className={styles.bnbTest}
              target={'_blank'}
              href={'https://testnet.binance.org/faucet-smart'}
            >
              BSC Testnet Faucet
            </a>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <div className={styles.head}>Blockchain</div>
        <div className={styles.card}>
          <div className={styles.title}>Account Address:</div>
          <div className={`font12 greyColor ${styles.account}`}>
            <span style={{ marginRight: 10, fontSize: 18 }}>{account}</span>
            <CopyText text={account} />
            <Space wrap>
              <Button
                size={'small'}
                className={styles.privateKey}
                onClick={getPrivateKey}
              >
                Private Key
              </Button>
            </Space>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <div className={styles.head}>Peers</div>
        <CashOut
          data={trafficCheques}
          cashOut={cashOut}
          visible={visible}
          setVisible={setVisible}
          confirmLoading={confirmLoading}
          setConfirmLoading={setConfirmLoading}
        />
      </div>
    </>
  );
};

const Peers: React.FC = (props) => {
  const { status } = useSelector((state: Models) => state.global);
  return <>{status ? <Main /> : <NotConnected />}</>;
};

export default Peers;

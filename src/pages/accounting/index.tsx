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
import Api from '@/api/api';
// import DebugApi from '@/api/debugApi';
// import Popup from '@/components/popup';
import Keystore from '@/components/keystore';

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
  const cashOut = async (overlay: string): Promise<void> => {
    setConfirmLoading(true);
    try {
      const { data } = await Api.cashOut(api, overlay);
      const provider = new ethers.providers.JsonRpcProvider(api + '/chain');
      let lock = false;
      let timer = setInterval(async () => {
        if (lock) return;
        lock = true;
        let res = await provider.getTransactionReceipt(data.hash);
        if (res) {
          clearInterval(timer);
          setTimeout(() => {
            setConfirmLoading(false);
            setVisible(false);
            if (res.status) {
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
            } else {
              message.error('cashout failure');
            }
          }, 3000);
        }
        lock = false;
      }, 1000);
    } catch (e) {
      setConfirmLoading(false);
      setVisible(false);
      if (e instanceof Error) message.error(e.message);
    }
  };
  // const getKeystore = async (): Promise<void> => {
  //   setKV(true);
  //   // const { data } = await DebugApi.getKeystore(debugApi);
  //   // let jsonStr = JSON.stringify(data);
  //   // Modal.info({
  //   //   centered: true,
  //   //   icon: <></>,
  //   //   closable: true,
  //   //   okButtonProps: { style: { display: 'none' } },
  //   //   style: {
  //   //     height: 'auto',
  //   //   },
  //   //   width: 500,
  //   //   content: (
  //   //     <div className={styles.key}>
  //   //       <div>{jsonStr}</div>
  //   //       <div className={styles.copyKeystore}>
  //   //         <CopyText text={jsonStr}>
  //   //           <Button>Copy Keystore</Button>
  //   //         </CopyText>
  //   //       </div>
  //   //     </div>
  //   //   ),
  //   // });
  // };
  return (
    <>
      <div>
        <div className={styles.head}>Chequebook (MB)</div>
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
            <div style={{ marginLeft: 10 }}>
              <Keystore />
            </div>
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

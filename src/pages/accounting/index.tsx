import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.less';
import NotConnected from '@/components/notConnected';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import CopyText from '@/components/copyText';
import CashOut from '@/components/cashoOut';
import { trafficToBalance } from '@/utils/util';
import { ethers } from 'ethers';
import { message } from 'antd';
import Api from '@/api/api';

import Keystore from '@/components/keystore';
import _, { values } from 'lodash';

const Main: React.FC = () => {
  const dispatch = useDispatch();
  const [balance, setBalance] = useState('');
  let [trafficChequesObj] = useState({});
  const { api, ws, refresh } = useSelector((state: Models) => state.global);
  const { account, trafficInfo, trafficCheques } = useSelector(
    (state: Models) => state.accounting,
  );

  const subResult = useRef({
    info: {
      id: 41,
      result: '',
    },
    cheques: {
      id: 42,
      result: '',
    },
    cashOut: {
      id: 43,
      result: '',
    },
  }).current;

  const getBalance = async () => {
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
  const getTrafficCheques = async (status: boolean = false) => {
    const { data } = await Api.getTrafficCheques(api);
    // console.log('data', data);
    if (data) {
      data.map((item, index) => (trafficChequesObj[item.peer] = item));
    }
    dispatch({
      type: 'accounting/setTrafficCheques',
      payload: {
        trafficCheques: data,
      },
    });
    if (status && data) {
      let arr = data.map((item) => item.peer);
      subCheques(arr);
      subCashOut(arr);
    }
  };

  const getTrafficInfo = async () => {
    const { data } = await Api.getTrafficInfo(api);
    dispatch({
      type: 'accounting/setTrafficInfo',
      payload: {
        trafficInfo: data,
      },
    });
  };
  const subInfo = () => {
    ws?.send(
      {
        id: subResult.info.id,
        jsonrpc: '2.0',
        method: 'traffic_subscribe',
        params: ['header'],
      },
      (err, res) => {
        if (err || res?.error) {
          message.error(err || res?.error);
        }
        subResult.info.result = res?.result;
        ws?.on(res?.result, (res) => {
          console.log(res);
          dispatch({
            type: 'accounting/setTrafficInfo',
            payload: {
              trafficInfo: res,
            },
          });
        });
      },
    );
  };
  const subCheques = (arr: string[]) => {
    ws?.send(
      {
        id: subResult.cheques.id,
        jsonrpc: '2.0',
        method: 'traffic_subscribe',
        params: ['trafficCheque', arr],
      },
      (err, res) => {
        if (err || res?.error) {
          message.error(err || res?.error);
        }
        subResult.cheques.result = res?.result;
        ws?.on(res?.result, (res) => {
          console.log(res);
          dispatch({
            type: 'accounting/setTrafficCheques',
            payload: {
              // trafficCheques: _.unionWith(
              //   res,
              //   trafficCheques,
              //   (a, b) => a.peer === b.peer,
              // ),
              trafficCheques: mergetrafficData(res, trafficChequesObj),
            },
          });
        });
      },
    );
  };

  const mergetrafficData = (res, initObj) => {
    let tem = [];
    res.forEach((item) => {
      initObj[item.peer] = item;
    });
    for (let key in initObj) {
      tem.push(initObj[key]);
    }
    return tem;
  };

  const subCashOut = (arr: string[]) => {
    ws?.send(
      {
        id: subResult.cashOut.id,
        jsonrpc: '2.0',
        method: 'traffic_subscribe',
        params: ['cashOut', arr],
      },
      (err, res) => {
        if (err || res?.error) {
          message.error(err || res?.error);
        }
        subResult.cashOut.result = res?.result;
        ws?.on(res?.result, (res: { overlay: string; status: boolean }[]) => {
          console.log(res);
          res.forEach((item) => {
            if (item.status) {
              message.success(item.overlay + ' ' + 'cashout success');
            } else {
              message.error(item.overlay + ' ' + 'cashout failed');
              cashOutList = [];
            }
          });
          listenCashOutList();
        });
      },
    );
  };

  let cashOutList = useRef<string[]>([]).current;

  const listenCashOutList = async () => {
    console.log(cashOutList);
    if (cashOutList.length) {
      if (!refresh) {
        dispatch({
          type: 'global/setRefresh',
          payload: {
            refresh: true,
          },
        });
      }
      let overlay = cashOutList.shift();
      // @ts-ignore
      await Api.cashOut(api, overlay);
    } else {
      dispatch({
        type: 'global/setRefresh',
        payload: {
          refresh: false,
        },
      });
    }
  };
  const unSub = () => {
    Object.values(subResult).forEach((item) => {
      ws?.send(
        {
          id: item.id,
          jsonrpc: '2.0',
          method: 'traffic_unsubscribe',
          params: [item.result],
        },
        (err, res) => {
          console.log(err, res);
        },
      );
    });
  };

  useEffect(() => {
    subInfo();
    getTrafficCheques(true);
    getBalance();
    getTrafficInfo();
    return () => {
      unSub();
    };
  }, []);

  const cashOut = async (overlay: string): Promise<void> => {
    try {
      cashOutList.push(overlay);
      await listenCashOutList();
    } catch (e) {
      if (e instanceof Error) message.error(e.message);
    }
  };

  const cashOutAll = async (overlayArr: string[]): Promise<void> => {
    try {
      cashOutList.push(...overlayArr);
      await listenCashOutList();
    } catch (e) {
      if (e instanceof Error) message.error(e.message);
    }
  };

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
          cashOutAll={cashOutAll}
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

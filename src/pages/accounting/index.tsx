import React, { useEffect, useState } from 'react';
import styles from './index.less';
import NotConnected from '@/components/notConnected';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import Card from '@/components/card';
import Web3 from 'web3';
import CopyText from '@/components/copyText';

const Main: React.FC = () => {
  const dispatch = useDispatch();
  const [balance, setBalance] = useState('');
  const { api } = useSelector((state: Models) => state.global);
  const { account } = useSelector((state: Models) => state.accounting);
  const getData = async () => {
    const web3 = new Web3(api + '/chain');
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    dispatch({
      type: 'accounting/setAccount',
      payload: {
        account,
      },
    });
    const wei = await web3.eth.getBalance(account);
    const bnb = web3.utils.fromWei(wei, 'ether');
    setBalance(bnb);
  };
  useEffect(() => {
    getData();
  }, []);
  return (
    <>
      <div>
        <div className={styles.head}>Chequebook</div>
        <div>
          <div className={styles.card}>
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
        <Card
          title={'Account Address:'}
          text={
            <div className={'font12'}>
              <span style={{ marginRight: 10, fontSize: 18 }}>{account}</span>
              <CopyText text={account} />
            </div>
          }
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

import React, { useEffect, useState } from 'react';
import styles from './index.less';
import NotConnected from '@/components/notConnected';
import { useDispatch, useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import Card from '@/components/card';
import PeersList from '@/components/peersList';
import { time } from '@/config/url';
import classNames from 'classnames';
import { Button, Input, message, Modal } from 'antd';
import { connect } from '@/api/debugApi';

const Main: React.FC = () => {
  const dispatch = useDispatch();
  const [peersList, setPeersList] = useState('full');
  const { debugApi, topology } = useSelector((state: Models) => state.global);
  const { addresses } = useSelector((state: Models) => state.info);
  const { peers } = useSelector((state: Models) => state.peers);
  const [visible, setVisible] = useState(false);
  const [connectValue, setConnectValue] = React.useState('');
  const getInfo = () => {
    dispatch({
      type: 'global/getTopology',
      payload: {
        url: debugApi,
      },
    });
    dispatch({
      type: 'peers/getPeers',
      payload: {
        url: debugApi,
      },
    });
  };
  useEffect(() => {
    dispatch({
      type: 'info/getAddresses',
      payload: {
        url: debugApi,
      },
    });
    getInfo();
    let timer = setInterval(getInfo, time);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const cancel = (): void => {
    setConnectValue('');
    setVisible(false);
  };
  const connectHandle = async (): Promise<void> => {
    let underlay = connectValue.replace(/^(\/)*/, '');
    try {
      await connect(debugApi, underlay);
      message.success('successful');
      getInfo();
    } catch (err) {
      if (err instanceof Error) {
        let errMessage =
          err.message === 'already connected' ? 'already connected' : 'failed';
        message.info(errMessage);
      }
    }
    cancel();
  };
  return (
    <>
      <div>
        <div>
          <Card
            title={'Discovered Full Peers'}
            text={
              (topology?.population || 0) +
              (topology?.bootNodes?.connected || 0)
            }
          />
        </div>
        <div style={{ display: 'flex', marginTop: '30px' }}>
          <Card
            title={'Connected Full Peers'}
            text={
              (topology?.connected || 0) + (topology?.bootNodes?.connected || 0)
            }
            style={{ flex: 1, marginRight: '50px' }}
          />
          <Card
            title={'Connected Light Peers'}
            text={topology?.lightNodes?.connected || 0}
            style={{ flex: 1, marginRight: '50px' }}
          />
          <Card
            title={'Depth'}
            text={topology?.depth || 0}
            style={{ flex: 1 }}
          />
        </div>
        <div className={styles.peers}>
          <div style={{ display: 'flex' }}>
            <h3
              className={classNames({
                [styles.peersList]: true,
                [styles.peersListSelect]: peersList === 'full',
              })}
              onClick={() => {
                setPeersList('full');
              }}
            >
              Full Peers
            </h3>
            <h3
              className={classNames({
                [styles.peersList]: true,
                [styles.peersListSelect]: peersList === 'light',
              })}
              onClick={() => {
                setPeersList('light');
              }}
            >
              Light Peers
            </h3>
            <div className={styles.addConnection}>
              <Button
                onClick={() => {
                  setVisible(true);
                }}
              >
                Add Connection
              </Button>
              <Modal
                title="Add Connection"
                footer={[
                  <Button key="back" onClick={cancel}>
                    Cancel
                  </Button>,
                  <Button
                    key="submit"
                    disabled={!connectValue}
                    onClick={connectHandle}
                  >
                    Add
                  </Button>,
                ]}
                visible={visible}
                onCancel={cancel}
                bodyStyle={{ padding: '20px 15px' }}
              >
                <div>
                  <div>
                    Insert the peer underlay/overlay address you want to connect
                    to.
                  </div>
                  <div>Example:</div>
                  <div className={'greyColor'}>
                    /ip4/192.100.255.18/tcp/1634/p2p/16Uiu2HAkvEorAWzPfdbThKexs1TQAhAjXMTTwtSSsQNzdbbHUovK
                  </div>
                  {/*<div className={'greyColor'}>{addresses?.underlay?.[0]}</div>*/}
                  {/*<div>or</div>*/}
                  {/*<div className={'greyColor'}>{addresses?.overlay}</div>*/}
                  <Input
                    value={connectValue}
                    onChange={(e) => setConnectValue(e.target.value)}
                    style={{ marginTop: 10 }}
                  />
                </div>
              </Modal>
            </div>
          </div>
          <PeersList
            peers={peers.filter(
              (item) => item.fullNode === (peersList === 'full'),
            )}
          />
        </div>
      </div>
    </>
  );
};

const Peers: React.FC = (props) => {
  const { status } = useSelector((state: Models) => state.global);
  return <>{status ? <Main /> : <NotConnected />}</>;
};

export default Peers;

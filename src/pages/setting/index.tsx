import React, { useState } from 'react';
import { useSelector, useDispatch } from 'umi';
import styles from './index.less';
import SettingApi from '@/components/settingApi';
import { Button } from 'antd';
import { sessionStorageApi, sessionStorageDebugApi } from '@/config/url';
import { checkSession, isURL } from '@/utils/util';
import { Models } from '@/declare/modelType';

const Setting: React.FC = (props) => {
  const dispatch = useDispatch();

  const { api, debugApi, status } = useSelector(
    (state: Models) => state.global,
  );

  const [apiValue, setApiValue] = useState<string>(
    checkSession(sessionStorageApi) || api || '',
  );

  const [debugApiValue, setDebugApiValue] = useState<string>(
    checkSession(sessionStorageDebugApi) || debugApi || '',
  );

  const saveApi = (): void => {
    sessionStorage.setItem(sessionStorageApi, apiValue);
    sessionStorage.setItem(sessionStorageDebugApi, debugApiValue);
    if (!status || api !== apiValue || debugApi !== debugApiValue)
      dispatch({
        type: 'global/initMetrics',
      });
    dispatch({
      type: 'global/getStatus',
      payload: {
        api: apiValue,
        debugApi: debugApiValue,
      },
    });
  };

  return (
    <>
      <div className={styles.api}>
        <SettingApi value={apiValue} title={'API Endpoint'} fn={setApiValue} />
      </div>
      <div className={styles.debug_api}>
        <SettingApi
          value={debugApiValue}
          title={'Debug API Endpoint'}
          fn={setDebugApiValue}
        />
      </div>
      <div style={{ marginTop: '50px' }}>
        <Button size={'large'} onClick={saveApi}>
          <span style={{ letterSpacing: '2px', padding: '0 20px' }}>
            Connect
          </span>
        </Button>
      </div>
    </>
  );
};

export default Setting;

import ModelsType from '@/declare/modelType';
import { defaultDebugApi, defaultApi, sessionStorageDebugApi, sessionStorageApi } from '@/config/url';
import { checkSession } from '@/utils/util';
import { isStatus } from '@/api/common';
import { message, Button } from 'antd';
import { Topology } from '@/declare/api';
import DebugApi from '@/api/debugApi';
import { getConfirmation } from '@/utils/request';


export interface State {
  status: boolean,
  api: string,
  debugApi: string,
  refresh: boolean,
  health: {
    status: string,
    version: string,
    fullNode: boolean,
    bootNodeMode: boolean
  } | null,
  topology: Topology,
}

export default {
  state: {
    refresh: true,
    status: false,
    api: checkSession(sessionStorageApi) || defaultApi,
    debugApi: checkSession(sessionStorageDebugApi) || defaultDebugApi,
    health: null,
    topology: {},
  },
  reducers: {
    setApi(state, { payload }) {
      const { api, debugApi } = payload;
      return {
        ...state,
        api,
        debugApi,
      };
    },
    setStatus(state, { payload }) {
      const { status } = payload;
      return {
        ...state,
        status,
      };
    },
    setRefresh(state, { payload }) {
      const { refresh } = payload;
      return {
        ...state,
        refresh,
      };
    },
    setHealth(state, { payload }) {
      const { health } = payload;
      return {
        ...state,
        health,
      };
    },
    setTopology(state, { payload }) {
      const { topology } = payload;
      return {
        ...state,
        topology,
      };
    },
  },
  effects: {
    * getStatus({ payload }, { call, put }) {
      const { api, debugApi } = payload;
      try {
        const data = yield call(isStatus, api, debugApi);
        const status = data[0].data && data[1].data.status === 'ok';
        yield put({
          type: 'setStatus',
          payload: {
            status,
          },
        });
        if (status) {
          message.success('Connection succeeded');
          yield put({
            type: 'setHealth',
            payload: {
              health: data[1].data,
            },
          });
        }
      } catch (err) {
        if (err instanceof Error) message.info(err.message);
        yield put({
          type: 'setStatus',
          payload: {
            status: false,
          },
        });
      } finally {
        yield put({
          type: 'setRefresh',
          payload: {
            refresh: false,
          },
        });
        yield put({ type: 'setApi', payload: { api, debugApi } });
      }
    },
    * getTopology({ payload }, { call, put }) {
      const { url } = payload;
      try {
        const { data } = yield call(DebugApi.getTopology, url);
        yield put({
          type: 'setTopology',
          payload: {
            topology: data,
          },
        });
      } catch (err) {
        if (err instanceof Error) message.info(err.message);
      }
    },
  },
  subscriptions: {
    setup({ history }) {
      return history.listen(() => {
        getConfirmation();
      });
    },
  },
} as ModelsType<State>;

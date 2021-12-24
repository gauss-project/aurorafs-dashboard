import ModelsType from '@/declare/modelType';
import { Cheque, TrafficInfo } from '@/declare/api';
import { getTrafficInfo, getTrafficCheques, cashOut } from '@/api/api';
import { message } from 'antd';
import { ethers } from 'ethers';

export interface State {
  account: string;
  trafficInfo: TrafficInfo;
  trafficCheques: Cheque[];
}

export default {
  state: {
    account: '',
    trafficInfo: {
      balance: 0,
      availableBalance: 0,
      totalSendTraffic: 0,
      receivedTraffic: 0,
    },
    trafficCheques: [],
  },
  reducers: {
    setAccount(state, { payload }) {
      const { account } = payload;
      return {
        ...state,
        account,
      };
    },
    setTrafficInfo(state, { payload }) {
      const { trafficInfo } = payload;
      return {
        ...state,
        trafficInfo,
      };
    },
    setTrafficCheques(state, { payload }) {
      const { trafficCheques } = payload;
      return {
        ...state,
        trafficCheques,
      };
    },
  },
  effects: {
    *getTrafficInfo({ payload }, { call, put }) {
      const { url } = payload;
      try {
        const { data } = yield call(getTrafficInfo, url);
        yield put({
          type: 'setTrafficInfo',
          payload: {
            trafficInfo: data,
          },
        });
      } catch (e) {
        if (e instanceof Error) message.info(e.message);
      }
    },
    *getTrafficCheques({ payload }, { call, put }) {
      const { url } = payload;
      try {
        const { data } = yield call(getTrafficCheques, url);
        yield put({
          type: 'setTrafficCheques',
          payload: {
            trafficCheques: data,
          },
        });
      } catch (e) {
        if (e instanceof Error) message.info(e.message);
      }
    },
    *cashOut({ payload, callback }, { call, put }) {
      const { url, overlay } = payload;
      try {
        yield call(cashOut, url, overlay);
        message.success('cashOut submitted');
      } catch (e) {
        if (e instanceof Error) message.info(e.message);
      }
    },
  },
  subscriptions: {},
} as ModelsType<State>;

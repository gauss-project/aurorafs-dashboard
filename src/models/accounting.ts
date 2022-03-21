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
  effects: {},
  subscriptions: {},
} as ModelsType<State>;

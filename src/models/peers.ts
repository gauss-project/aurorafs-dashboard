import ModelsType from '@/declare/modelType';
import { Peers } from '@/declare/api';
import DebugApi from '@/api/debugApi';
import { message } from 'antd';

export interface State {
  peers: Peers,
}

export default {
  state: {
    peers: [],
  },
  reducers: {
    setPeers(state, { payload }) {
      const { peers } = payload;
      return {
        ...state,
        peers,
      };
    },
  },
  effects: {
    * getPeers({ payload }, { call, put }) {
      const { debugApi } = payload;
      try {
        const { data }  = yield call(DebugApi.getPeers,debugApi);
        console.log("peers",data);
        yield put({
          type:"setPeers",
          payload:{
            peers:data.peers,
          }
        })
      }
      catch (err){
        if (err instanceof Error) message.info(err.message);
      }
    },
  },
  subscriptions: {},
} as ModelsType<State>


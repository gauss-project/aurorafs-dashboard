import ModelsType from '@/declare/modelType';

export interface State {
  account: string;
}

export default {
  state: {
    account: '',
  },
  reducers: {
    setAccount(state, { payload }) {
      const { account } = payload;
      return {
        ...state,
        account,
      };
    },
  },
  effects: {},
  subscriptions: {},
} as ModelsType<State>;

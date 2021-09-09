import ModelsType from "@/declare/modelType";
export interface State {
  data: Array<object>,
}
export default {
  namespace: "template", // 默认与文件同名
  // 数据仓库
  state: {
    data: [],
  },
  // 同步操作
  reducers: {
    /**
     funcName(state,{payload}){
        const {data} = payload;
        return {
            ...state,
            data,
        }
     }
     */
  },
  // 异步操作
  effects:{
    /**
     * generator函数
     * put用于触发action,call用于调用异步操作,select用于获取state数据,is func
      *funcName({payload},{call,put,select}):void{}
     */
  },
  // 订阅
  subscriptions:{
    /**
     * dispatch 派发action,history 当前路由信息
     funcName({ dispatch, history }){}
     */
  }
} as ModelsType<State>;

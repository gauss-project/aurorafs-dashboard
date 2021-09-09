import { Effect, ImmerReducer, Reducer, Subscription } from 'umi';
import {State as GlobalState} from "@/models/global"
import {State as PeersState } from "@/models/peers"
import {State as InfoState } from "@/models/info"
import {State as FilesState } from "@/models/files"
export default interface ModelsType<T>{
  namespace?: string;
  state: T;
  reducers: {
    // [propName:string]: Reducer<State>;
    // 启用 immer 之后
    [propName:string]: ImmerReducer<T>;
  };
  effects?: {
    [propName:string]: Effect;
  };
  subscriptions?: {
    [propName:string]: Subscription
  };
}
export interface Models {
  global:GlobalState,
  peers:PeersState,
  info:InfoState,
  files:FilesState,
}

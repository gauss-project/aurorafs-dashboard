import axios, { Canceler } from 'axios';
import NProgress from 'nprogress';

import EventEmitter from 'eventemitter3';

export const eventEmitter = new EventEmitter();

const request = axios.create({
  baseURL: '',
});

let requestIndex: number = 0;
let responseIndex: number = 0;

let pending: Record<string, Canceler> = {};

const removeAllPendingRequestsRecord = (): void => {
  Object.values(pending).forEach((func) => {
    func();
  });
  pending = {};
};

const removePending = (key: string, isRequest = false): void => {
  if (pending[key] && isRequest) {
    pending[key]();
  }
  delete pending[key];
};

export const getConfirmation = (mes = '', callback = () => {
}): void => {
  removeAllPendingRequestsRecord();
  callback();
};

request.interceptors.request.use(
  config => {

    let reqData: string = '';
    
    if (config.method !== 'post') {
      config.timeout = 5 * 1000;
    }
    if (config.method === 'get') {
      reqData = config.url + config.method + JSON.stringify(config.params);
    } else {
      reqData = (config.url as string) + config.method + JSON.stringify(config.data);
    }

    removePending(reqData, true);

    config.cancelToken = new axios.CancelToken((c) => {
      pending[reqData] = c;
    });

    requestIndex++;
    NProgress.start();
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  response => {
    responseIndex++;
    if (responseIndex === requestIndex) {
      NProgress.done();
    }
    return response;
  },
  error => {
    responseIndex = requestIndex = 0;
    NProgress.done();
    if (axios.isCancel(error)) {
      return new Promise(() => {
      });
    }
    if (error.message === 'Network Error') {
      eventEmitter.emit('404');
      return Promise.reject(new Error('Connection Failed'));
    }
    return Promise.reject(error.response?.data?.message ? Error(error.response?.data.message) : error);
  },
);

export default request;

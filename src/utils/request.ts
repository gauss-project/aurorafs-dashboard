import axios, { Canceler } from 'axios';
import NProgress from 'nprogress';

const request = axios.create({
  baseURL: '',
  timeout: 1e4,
});

let requestIndex: number = 0;
let responseIndex: number = 0;

// 取消请求操作
const allPendingRequestsRecord: Array<Canceler> = [];
const pending: Record<string, Canceler> = {};
const removeAllPendingRequestsRecord = (): void => {
  allPendingRequestsRecord && allPendingRequestsRecord.forEach((func) => {
    func();
  });
  allPendingRequestsRecord.splice(0);
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

    let reqData:string = '';

    if (config.method === 'get') {
      reqData = config.url + config.method + JSON.stringify(config.params);
    } else {
      reqData = (config.url as string) + config.method + JSON.stringify(config.data);
    }

    removePending(reqData, true);

    config.cancelToken = new axios.CancelToken((c) => {
      pending[reqData] = c;
      allPendingRequestsRecord.push(c);
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
    return Promise.reject(error);
  },
);

export default request;

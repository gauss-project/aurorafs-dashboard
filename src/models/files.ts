import ModelsType, { Models } from '@/declare/modelType';
import { FileType } from '@/declare/api';

import Api from '@/api/api';
import { message } from 'antd';

const queryData = {
  page: {
    pageNum: 1,
    pageSize: 10,
  },
  sort: {
    key: 'rootCid',
    order: 'asc',
  },
  filter: [],
};

interface queryType {
  page: {
    pageNum: number;
    pageSize: number;
  };
  sort: {
    key: string;
    order: string;
  };
  filter: filterType[];
}

export interface filterType {
  key: string;
  value: string;
  term: string;
}

export interface State {
  filesList: FileType[];
  uploadStatus: boolean;
  filesTotal: number;
  queryData: queryType;
}

export default {
  state: {
    uploadStatus: false,
    filesList: [],
    filesTotal: 0,
    queryData,
  },
  reducers: {
    setFilesList(state, { payload }) {
      const { filesList, filesTotal } = payload;
      return {
        ...state,
        filesList: filesList ? filesList : state.filesList,
        filesTotal: filesTotal ? filesTotal : state.filesTotal,
      };
    },
    setUploadStatus(state, { payload }) {
      const { uploadStatus } = payload;
      return {
        ...state,
        uploadStatus,
      };
    },
    setQueryData(state, { payload }) {
      const { page, sort, filter } = payload;
      return {
        ...state,
        queryData: {
          page: page ? page : state.queryData.page,
          sort: sort ? sort : state.queryData.sort,
          filter: filter ? filter : state.queryData.filter,
        },
      };
    },
    initQueryData(state) {
      return {
        ...state,
        queryData,
      };
    },
  },
  effects: {
    *upload({ payload }, { call, put }) {
      const { url, file, fileAttr } = payload;
      try {
        yield put({ type: 'setUploadStatus', payload: { uploadStatus: true } });
        yield call(Api.uploadFile, url, file, fileAttr);
        yield put({ type: 'getFilesList', payload: { url } });
        message.success('upload success');
      } catch (e) {
        if (e instanceof Error) message.info(e.message);
      } finally {
        yield put({
          type: 'setUploadStatus',
          payload: { uploadStatus: false },
        });
      }
    },
    *getFilesList({ payload }, { call, put, select }) {
      const { url } = payload;
      const { queryData } = yield select((state: Models) => state.files);

      let newQData: queryType = {
        ...queryData,
        filter: JSON.stringify(queryData.filter),
      };
      try {
        const { data } = yield call(Api.getFilesList, url, newQData);
        yield put({
          type: 'setFilesList',
          payload: {
            filesList: data.list,
            filesTotal: data.total,
          },
        });
      } catch (e) {
        if (e instanceof Error) message.info(e.message);
      }
    },
    *pinOrUnPin({ payload }, { call, put }) {
      const { url, hash, pinState } = payload;
      try {
        const { data } = pinState
          ? yield call(Api.unPin, url, hash)
          : yield call(Api.pin, url, hash);
        if (data.code === 200 || data.code === 201) {
          message.success(data.message, 0.1);
          yield put({ type: 'getFilesList', payload: { url } });
        }
      } catch (e) {
        if (e instanceof Error) message.info(e.message);
      }
    },
    *deleteFile({ payload }, { call, put }) {
      const { url, hash } = payload;
      try {
        const { data } = yield call(Api.deleteFile, url, hash);
        message.success(data.message);
        yield put({ type: 'getFilesList', payload: { url } });
        yield put({ type: 'files/deleteDLHash', payload: { hash } });
      } catch (e) {
        if (e instanceof Error) message.info(e.message);
      }
    },
    *changeQuery({ payload }, { call, put, select }) {
      yield put({
        type: 'setQueryData',
        payload: payload.options,
      });

      yield put({
        type: 'getFilesList',
        payload: {
          url: payload.url,
        },
      });
    },
  },
  subscriptions: {},
} as ModelsType<State>;

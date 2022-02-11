import ModelsType from '@/declare/modelType';
import { FileType } from '@/declare/api';

import Api from '@/api/api';
import { message } from 'antd';
import { mapQueryM3u8 } from '@/utils/util';
import _ from 'lodash';

export interface State {
  filesList: FileType[];
  uploadStatus: boolean;
  downloadList: string[];
}

export default {
  state: {
    uploadStatus: false,
    filesList: [],
    downloadList: [],
  },
  reducers: {
    deleteDLHash(state, { payload }) {
      const downloadList = state.downloadList.slice();
      const { hash } = payload;
      const index = downloadList.indexOf(hash);
      if (index !== -1) {
        downloadList.splice(index, 1);
      }
      return {
        ...state,
        downloadList,
      };
    },
    addDLHash(state, { payload }) {
      const downloadList = state.downloadList.slice();
      const { hash } = payload;
      const index = downloadList.indexOf(hash);
      if (index === -1) {
        downloadList.push(hash);
      }
      return {
        ...state,
        downloadList,
      };
    },
    setFilesList(state, { payload }) {
      const { filesList } = payload;
      return {
        ...state,
        filesList,
      };
    },
    setUploadStatus(state, { payload }) {
      const { uploadStatus } = payload;
      return {
        ...state,
        uploadStatus,
      };
    },
    setDownloadList(state, { payload }) {
      const { downloadList } = payload;
      return {
        ...state,
        downloadList,
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
    *getFilesList({ payload }, { call, put }) {
      const { url } = payload;
      try {
        const { data } = yield call(Api.getFilesList, url);
        yield put({
          type: 'setFilesList',
          payload: {
            filesList: data,
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
  },
  subscriptions: {},
} as ModelsType<State>;

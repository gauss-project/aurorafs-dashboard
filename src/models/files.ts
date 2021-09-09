import ModelsType from '@/declare/modelType';
import { FileType } from '@/declare/api';
import Api from '@/api/api';
import { message } from 'antd';

export interface State {
  filesList: FileType[],
  uploadStatus: boolean,
}

export default {
  state: {
    uploadStatus: false,
    filesList: [
      {
        hash: '0c6f994991f3c3765648751d11cda9aaacda6073e4034b6890e7b038aaed62f8',
        size: '456MB',
        pin: true,
      },
    ],
  },
  reducers: {
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
  },
  effects: {
    * upload({ payload }, { call, put }) {
      const { url, file } = payload;
      try {
        yield put({ type: 'setUploadStatus', payload: { uploadStatus: true } });
        const { data } = yield call(Api.uploadFile, url, file);
        console.log(data);
      } catch (e) {
        if (e instanceof Error) message.info(e.message);
      } finally {
        yield put({ type: 'setUploadStatus', payload: { uploadStatus: false } });
        message.success('upload success');
      }
    },
  },
  subscriptions: {},
} as ModelsType<State>;

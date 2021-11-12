import ModelsType, { Models } from '@/declare/modelType';
import {
  defaultDebugApi,
  defaultApi,
  sessionStorageDebugApi,
  sessionStorageApi,
} from '@/config/url';
import { checkSession } from '@/utils/util';
import { isStatus } from '@/api/common';
import { message, Button } from 'antd';
import { Topology } from '@/declare/api';
import DebugApi from '@/api/debugApi';
import { getConfirmation } from '@/utils/request';
import semver from 'semver';
import { auroraVersion } from '@/config/version';

export type ErrorType = 'apiError' | 'versionError';

export interface State {
  status: boolean;
  api: string;
  debugApi: string;
  refresh: boolean;
  health: {
    status: string;
    version: string;
    fullNode: boolean;
    bootNodeMode: boolean;
  } | null;
  topology: Topology;
  metrics: {
    // retrievalDownload: number,
    // retrievalUpload: number,
    // chunkInfoDownload: number,
    // chunkInfoUpload: number
    downloadNumber: number;
    uploadNumber: number;
    downloadTotal: number;
    uploadTotal: number;
    downloadSpeed: number;
    uploadSpeed: number;
  };
}

export default {
  state: {
    refresh: true,
    status: false,
    api: checkSession(sessionStorageApi) || defaultApi,
    debugApi: checkSession(sessionStorageDebugApi) || defaultDebugApi,
    health: null,
    topology: {},
    metrics: {
      downloadNumber: -1,
      uploadNumber: -1,
      downloadTotal: 0,
      uploadTotal: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
    },
  },
  reducers: {
    setApi(state, { payload }) {
      const { api, debugApi } = payload;
      return {
        ...state,
        api,
        debugApi,
      };
    },
    setStatus(state, { payload }) {
      const { status } = payload;
      return {
        ...state,
        status,
      };
    },
    setRefresh(state, { payload }) {
      const { refresh } = payload;
      return {
        ...state,
        refresh,
      };
    },
    setHealth(state, { payload }) {
      const { health } = payload;
      return {
        ...state,
        health,
      };
    },
    setTopology(state, { payload }) {
      const { topology } = payload;
      return {
        ...state,
        topology,
      };
    },
    setMetrics(state, { payload }) {
      const { metrics } = payload;
      return {
        ...state,
        metrics,
      };
    },
    setSpeed(state, { payload }) {
      const { speed } = payload;
      return {
        ...state,
        speed,
      };
    },
  },
  effects: {
    *getStatus({ payload }, { call, put }) {
      const { api, debugApi } = payload;
      try {
        const data = yield call(isStatus, api, debugApi);
        const aurora = semver.satisfies(
          semver.coerce(data[1].data.version)?.version as string,
          `>=${auroraVersion}`,
        );
        const status = data[0].data && data[1].data.status === 'ok' && aurora;
        yield put({
          type: 'setStatus',
          payload: {
            status,
          },
        });
        if (status) {
          message.success('Connection succeeded');
          yield put({
            type: 'setHealth',
            payload: {
              health: data[1].data,
            },
          });
        } else if (!aurora) {
          message.error('Please upgrade the node version');
        }
      } catch (err) {
        if (err instanceof Error) message.info(err.message);
        yield put({
          type: 'setStatus',
          payload: {
            status: false,
          },
        });
      } finally {
        yield put({
          type: 'setRefresh',
          payload: {
            refresh: false,
          },
        });
        yield put({ type: 'setApi', payload: { api, debugApi } });
      }
    },
    *getTopology({ payload }, { call, put }) {
      const { url } = payload;
      try {
        const { data } = yield call(DebugApi.getTopology, url);
        yield put({
          type: 'setTopology',
          payload: {
            topology: data,
          },
        });
      } catch (err) {
        if (err instanceof Error) message.info(err.message);
      }
    },
    *getMetrics({ payload }, { call, put, select }) {
      const { url } = payload;
      const { data } = yield call(DebugApi.getMetrics, url);
      const { metrics } = yield select((state: Models) => state.global);
      const retrievalDownload =
        Number(
          data.match(/\baurora_retrieval_total_retrieved\b\s(\d+)/)?.[1],
        ) ?? 0;
      const retrievalUpload =
        Number(
          data.match(/\baurora_retrieval_total_transferred\b\s(\d+)/)?.[1],
        ) ?? 0;
      const chunkInfoDownload =
        Number(
          data.match(/\baurora_chunkinfo_total_retrieved\b\s(\d+)/)?.[1],
        ) ?? 0;
      const chunkInfoUpload =
        Number(
          data.match(/\baurora_chunkinfo_total_transferred\b\s(\d+)/)?.[1],
        ) ?? 0;
      if (metrics.downloadNumber === -1 || metrics.uploadNumber === -1) {
        yield put({
          type: 'setMetrics',
          payload: {
            metrics: {
              downloadNumber: retrievalDownload,
              uploadNumber: retrievalUpload,
              downloadTotal: retrievalDownload + chunkInfoDownload,
              uploadTotal: retrievalUpload + chunkInfoUpload,
              downloadSpeed: 0,
              uploadSpeed: 0,
            },
          },
        });
      } else {
        yield put({
          type: 'setMetrics',
          payload: {
            metrics: {
              downloadNumber: retrievalDownload,
              uploadNumber: retrievalUpload,
              downloadTotal: retrievalDownload + chunkInfoDownload,
              uploadTotal: retrievalUpload + chunkInfoUpload,
              downloadSpeed: retrievalDownload - metrics.downloadNumber,
              uploadSpeed: retrievalUpload - metrics.uploadNumber,
            },
          },
        });
      }
    },
  },
  subscriptions: {
    setup({ history }) {
      return history.listen(() => {
        getConfirmation();
      });
    },
  },
} as ModelsType<State>;

import ModelsType, { Models } from '@/declare/modelType';
import {
  defaultDebugApi,
  defaultApi,
  sessionStorageDebugApi,
  sessionStorageApi,
} from '@/config/url';
import { checkSession, initChartData } from '@/utils/util';
import { isStatus } from '@/api/common';
import { message, Button } from 'antd';
import { Topology } from '@/declare/api';
import DebugApi from '@/api/debugApi';
import { getConfirmation } from '@/utils/request';
import semver from 'semver';
import { auroraVersion } from '@/config/version';
import { speedTime } from '@/config/url';
import moment from 'moment';

export type ErrorType = 'apiError' | 'versionError';

export type ChartData = {
  time: string;
  category: 'retrieved' | 'transferred';
  speed: number;
};

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
    downloadNumber: number;
    uploadNumber: number;
    downloadTotal: number;
    uploadTotal: number;
    downloadSpeed: number;
    uploadSpeed: number;
  };
  chartData: ChartData[];
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
    chartData: [],
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
    setChartData(state, { payload }) {
      const { chartData } = payload;
      return {
        ...state,
        chartData,
      };
    },
    initMetrics(state) {
      return {
        ...state,
        metrics: {
          downloadNumber: -1,
          uploadNumber: -1,
          downloadTotal: 0,
          uploadTotal: 0,
          downloadSpeed: 0,
          uploadSpeed: 0,
        },
        chartData: [],
      };
    },
  },
  effects: {
    *getStatus({ payload }, { call, put }) {
      const { api, debugApi } = payload;
      try {
        const data = yield call(isStatus, api, debugApi);
        yield put({ type: 'setApi', payload: { api, debugApi } });
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
      const { metrics, chartData } = yield select(
        (state: Models) => state.global,
      );
      const retrievalDownload =
        Number(
          data.match(/\baurora_retrieval_total_retrieved\b\s(\d+)/)?.[1],
        ) ?? metrics.downloadNumber;
      const retrievalUpload =
        Number(
          data.match(/\baurora_retrieval_total_transferred\b\s(\d+)/)?.[1],
        ) ?? metrics.uploadNumber;
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
              downloadTotal:
                (retrievalDownload < 0 ? 0 : retrievalDownload) +
                chunkInfoDownload,
              uploadTotal:
                (retrievalUpload < 0 ? 0 : retrievalUpload) + chunkInfoUpload,
              downloadSpeed: 0,
              uploadSpeed: 0,
            },
          },
        });
        yield put({
          type: 'setChartData',
          payload: {
            chartData: initChartData(120, speedTime),
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
        let newChartData: ChartData[] = chartData.concat([
          {
            time: moment().utcOffset(480).format('HH.mm.ss'),
            category: 'retrieved',
            speed:
              ((retrievalDownload - metrics.downloadNumber) * 256) /
              1024 /
              (speedTime / 1000),
          },
          {
            time: moment().utcOffset(480).format('HH.mm.ss'),
            category: 'transferred',
            speed:
              ((retrievalUpload - metrics.uploadNumber) * 256) /
              1024 /
              (speedTime / 1000),
          },
        ]);
        newChartData.splice(0, 2);
        yield put({
          type: 'setChartData',
          payload: {
            chartData: newChartData,
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

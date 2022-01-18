import request from '@/utils/request';
import { AxiosResponse } from 'axios';
import { Topology, Peers, ChunkSource } from '@/declare/api';

export const getHealth = (url: string): Promise<any> => {
  return request({
    url: url + '/health',
  });
};

export const getTopology = (url: string): Promise<AxiosResponse<Topology>> => {
  return request({
    url: url + '/topology',
  });
};

export const getPeers = (url: string): Promise<AxiosResponse<Peers>> => {
  return request({
    url: url + '/peers',
  });
};

export const getAddresses = (url: string): Promise<AxiosResponse<Peers>> => {
  return request({
    url: url + '/addresses',
  });
};

export const getMetrics = (url: string): Promise<AxiosResponse<string>> => {
  return request({
    url: url + '/metrics',
  });
};

export const getChunkSource = (
  url: string,
  hash: string,
): Promise<AxiosResponse<ChunkSource>> => {
  return request({
    url: url + '/chunk/source/' + hash,
  });
};

export const connect = (
  url: string,
  underlay: string,
): Promise<AxiosResponse<{ address: string }>> => {
  return request({
    url: url + '/connect/' + underlay,
    method: 'post',
  });
};

export const getKeystore = (url: string): Promise<AxiosResponse<any>> => {
  return request({
    url: url + '/keystore',
  });
};

export default {
  getHealth,
  getTopology,
  getPeers,
  getAddresses,
  getMetrics,
  getChunkSource,
  connect,
  getKeystore,
};

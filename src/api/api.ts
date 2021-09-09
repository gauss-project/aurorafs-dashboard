import request from '@/utils/request';
import { AxiosResponse } from 'axios';

export const isConnected = (url: string): Promise<any> => {
  return request({
    url,
  });
};

export const uploadFile = (url: string, file: File): Promise<AxiosResponse<{ reference: string }>> => {
  return request({
    url: url + '/files',
    method: 'post',
    data:file,
    params:{name:file.name},
  });
};

export const pin = (url: string, hash:string): Promise<AxiosResponse<any>> => {
  return request({
    url: url + '/pin/files/' + hash,
    method: 'post',
  });
};

export const unPin = (url: string, hash:string): Promise<AxiosResponse<any>> => {
  return request({
    url: url + '/pin/files/' + hash,
    method: 'delete',
  });
};


export default {
  isConnected,
  uploadFile,
  pin,
  unPin,
};

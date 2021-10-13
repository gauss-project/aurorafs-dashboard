import request from '@/utils/request';
import { AxiosResponse } from 'axios';
import { FileType, Peers } from '@/declare/api';

export const isConnected = (url: string): Promise<AxiosResponse<string>> => {
  return request({
    url,
  });
};

export const uploadFile = (url: string, file: File): Promise<AxiosResponse<{ reference: string }>> => {
  let upload = file.type === 'application/x-tar' ? '/aurora' : '/files';
  return request({
    url: url + upload,
    method: 'post',
    data: file,
    params: { name: file.name },
    headers: {
      'Content-Type': file.type || 'application/x-www-form-urlencoded',
    },
  });
};

export const pin = (url: string, hash: string): Promise<AxiosResponse<any>> => {
  return request({
    url: url + '/pin/files/' + hash,
    method: 'post',
  });
};

export const unPin = (url: string, hash: string): Promise<AxiosResponse<any>> => {
  return request({
    url: url + '/pin/files/' + hash,
    method: 'delete',
  });
};

export const getFilesList = (url: string): Promise<AxiosResponse<FileType[]>> => {
  return request({
    url: url + '/files',
  });
};

export const deleteFile = (url: string, hash: string): Promise<any> => {
  return request({
    url: url + '/files/' + hash,
    method: 'delete',
  });
};


export default {
  isConnected,
  uploadFile,
  pin,
  unPin,
  getFilesList,
  deleteFile,
};

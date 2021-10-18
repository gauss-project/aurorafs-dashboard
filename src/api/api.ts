import request from '@/utils/request';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { FileInfo, FileType } from '@/declare/api';

export const isConnected = (url: string): Promise<AxiosResponse<string>> => {
  return request({
    url,
  });
};

export const uploadFile = (
  url: string,
  file: File,
): Promise<AxiosResponse<{ reference: string }>> => {
  let upload: string;
  let headers: AxiosRequestConfig['headers'];
  if (file.type === 'application/x-tar') {
    upload = '/aurora';
    let appointFile = file?.name.split('.').slice(0, -1).join('.');
    headers = {
      'Content-Type': file.type || 'application/x-www-form-urlencoded',
      'Boson-Index-Document': appointFile,
    };
  } else {
    upload = '/files';
    headers = {
      'Content-Type': file.type || 'application/x-www-form-urlencoded',
    };
  }
  return request({
    url: url + upload,
    method: 'post',
    data: file,
    params: { name: file.name },
    headers,
    timeout: 0,
  });
};

export const pin = (url: string, hash: string): Promise<AxiosResponse<any>> => {
  return request({
    url: url + '/pin/files/' + hash,
    method: 'post',
  });
};

export const unPin = (
  url: string,
  hash: string,
): Promise<AxiosResponse<any>> => {
  return request({
    url: url + '/pin/files/' + hash,
    method: 'delete',
  });
};

export const getFilesList = (
  url: string,
): Promise<AxiosResponse<FileType[]>> => {
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

export const downloadFile = (url: string, hash: string): Promise<any> => {
  return request({
    url: url + '/files/' + hash,
    method: 'get',
    responseType: 'blob',
  });
};

export const queryFile = (
  url: string,
  hash: string,
): Promise<AxiosResponse<FileInfo>> => {
  return request({
    url: url + '/manifest/' + hash,
    method: 'get',
  });
};

export default {
  isConnected,
  uploadFile,
  pin,
  unPin,
  getFilesList,
  deleteFile,
  downloadFile,
  queryFile,
};

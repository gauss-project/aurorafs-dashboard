import request from '@/utils/request';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { FileInfo, FileType, FileAttr } from '@/declare/api';
import { encodeUnicode } from '@/utils/util';

export const isConnected = (url: string): Promise<AxiosResponse<string>> => {
  return request({
    url,
  });
};

export const uploadDir = (
  url: string,
  fileList: any,
): Promise<AxiosResponse<string>> => {
  return request({
    url: url + '/aurora',
    method: 'post',
    data: fileList,
    headers: {
      'Aurora-Collection': true,
    },
    timeout: 0,
  });
};

export const uploadFile = (
  url: string,
  file: File,
  fileAttr: FileAttr,
): Promise<AxiosResponse<{ reference: string }>> => {
  let fileName: string = fileAttr.name;
  let headers: AxiosRequestConfig['headers'] = {};
  if (fileName) {
    headers['Aurora-Collection-Name'] = encodeUnicode(fileName);
  }
  headers['Aurora-Pin'] = fileAttr.pin;
  if (fileAttr.isTar) {
    headers['Aurora-Collection'] = true;
    headers['Content-Type'] = 'application/x-tar';
    if (fileAttr.dOpen) {
      headers['Aurora-Index-Document'] = encodeUnicode(fileAttr.dOpen);
    }
    if (fileAttr.eOPen) {
      headers['Aurora-Error-Document'] = encodeUnicode(fileAttr.eOPen);
    }
  } else {
    headers['Content-Type'] = file.type || 'application/x-www-form-urlencoded';
  }
  return request({
    url: url + '/aurora',
    method: 'post',
    data: file,
    params: { name: fileName },
    headers,
    timeout: 0,
  });
};

export const pin = (url: string, hash: string): Promise<AxiosResponse<any>> => {
  return request({
    url: url + '/pins/' + hash,
    method: 'post',
  });
};

export const unPin = (
  url: string,
  hash: string,
): Promise<AxiosResponse<any>> => {
  return request({
    url: url + '/pins/' + hash,
    method: 'delete',
  });
};

export const getFilesList = (
  url: string,
): Promise<AxiosResponse<FileType[]>> => {
  return request({
    url: url + '/aurora',
  });
};

export const deleteFile = (url: string, hash: string): Promise<any> => {
  return request({
    url: url + '/aurora/' + hash,
    method: 'delete',
    timeout: 30 * 1000,
  });
};

export const downloadFile = (url: string, hash: string): Promise<any> => {
  return request({
    url: url + '/aurora/' + hash,
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

import { FileSub } from '@/declare/api';

export const checkSession = (key: string): string | false => {
  const value = sessionStorage.getItem(key);
  if (value) return value;
  return false;
};
export const isURL = (url: string): boolean => {
  const strRegex =
    '^((https|http|ftp|rtsp|mms)?://)' +
    "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" +
    '(([0-9]{1,3}.){3}[0-9]{1,3}' +
    '|' +
    "([0-9a-z_!~*'()-]+.)*" +
    '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' +
    '[a-z]{2,6})' +
    '(:[0-9]{1,5})?' +
    '((/?)|' +
    "(/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+/?)$";
  const re = new RegExp(strRegex);
  return re.test(url);
};

export const getSize = (size: number, level: number = 0): string => {
  let levelList: string[] = ['B', 'KB', 'M', 'G', 'T'];
  let n: number = 0;
  while (size >= Math.pow(1024, n + 1)) {
    n++;
  }
  return (
    parseFloat((size / Math.pow(1024, n)).toFixed(2)) + levelList[level + n]
  );
};

export const stringToBinary = (
  b: string,
  len: number,
  size: number,
): string => {
  let value: string = '';
  let uStr: string = window.atob(b);
  for (let i: number = 0; i < uStr.length; i++) {
    value += uStr.charCodeAt(i).toString(2);
  }
  if (len > value.length) {
    return (
      '1'.repeat(size) + value + '0'.repeat(Math.abs(len + 1 - value.length))
    );
  }
  return '1'.repeat(size) + value;
};

export const getProgress = (b: string): number => {
  const oneLen: number = b.match(/1/g)?.length || 0;
  return (oneLen / b.length) * 100;
};

export const getSuffix = (fileName: string): string | undefined => {
  return fileName.split('.').pop();
};

export const mapQueryM3u8 = (sub: FileSub): boolean => {
  for (let i in sub) {
    if (sub[i].type === 'index') {
      return getSuffix(i) === 'm3u8' && sub[i].mime !== 'application/x-tar';
    }
  }
  return false;
};

export function encodeUnicode(str: string): string {
  let res = [];
  for (let i = 0; i < str.length; i++) {
    res[i] = ('00' + str.charCodeAt(i).toString(16)).slice(-4);
  }
  return '\\u' + res.join('\\u');
}

export function decodeUnicode(str: string): string {
  str = str.replace(/\\/g, '%');
  return unescape(str);
}

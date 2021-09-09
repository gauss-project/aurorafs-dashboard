import ex from 'umi/dist';

export const checkSession = (key: string): string | false => {
  const value = sessionStorage.getItem(key);
  if (value) return value;
  return false;
};
export const isURL = (url: string): boolean => {
  const strRegex = '^((https|http|ftp|rtsp|mms)?://)'
    + '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?'
    + '(([0-9]{1,3}.){3}[0-9]{1,3}'
    + '|'
    + '([0-9a-z_!~*\'()-]+.)*'
    + '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].'
    + '[a-z]{2,6})'
    + '(:[0-9]{1,5})?'
    + '((/?)|'
    + '(/[0-9a-zA-Z_!~*\'().;?:@&=+$,%#-]+)+/?)$';
  const re = new RegExp(strRegex);
  return re.test(url);
};

export const getSize = (size: number, level: number = 0): string => {
  let levelList: string[] = ['b', 'kb', 'M', 'G', 'T'];
  let n: number = 0;
  while (size >= Math.pow(1024, n + 1)) {
    n++;
  }
  return Math.floor(size / Math.pow(1024, n)) + levelList[level + n];
};

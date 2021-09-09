import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { notification, Tooltip } from 'antd';
import {
  CopyOutlined,
} from '@ant-design/icons';

export type Props = {
  text: string,
}
const CopyText: React.FC<Props> = (props) => {
  const copyHandle = (): void => {
    notification['success']({
      description: 'Copy Success',
      duration: 0.5,
      message: <></>,
    });
  };
  return <>
    <CopyToClipboard text={props.text} onCopy={copyHandle}>
      <Tooltip title='copy'  key={"copy"}>
        <CopyOutlined />
      </Tooltip>
    </CopyToClipboard>
  </>;
};
export default CopyText;


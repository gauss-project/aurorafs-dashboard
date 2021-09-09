import React from 'react';
import { Spin } from 'antd';

export type Props = {
  text: string,
  status: boolean,
}

const Loading: React.FC<Props> = props => {
  return <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(238,238,238,.85)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Spin
      spinning={props.status}
      delay={500}
      size='large'
      tip={props.text}
    />
  </div>;
};
export default Loading;

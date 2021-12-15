import React from 'react';

type Props = {
  title: string;
  text: string | number | React.ReactNode;
  style?: React.CSSProperties;
};

const Card: React.FC<Props> = (props) => {
  const { title, text, style } = props;
  return (
    <>
      <div style={{ boxShadow: ' 0 2px 10px 2px #ccc', padding: 20, ...style }}>
        <div>
          <span>{title}</span>
        </div>
        <div style={{ marginTop: '10px', fontSize: '24px' }}>{text}</div>
      </div>
    </>
  );
};
export default Card;

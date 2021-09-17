import React from 'react';
import styles from './index.less';
import classNames from 'classnames';

export type Props = {
  chunk: string,
}
const ChunkTooltip: React.FC<Props> = props => {
  const chunkArr: string[] = props.chunk.split('');
  return <ul className={styles.chunkTooltip}>
    {
      chunkArr.map((item, index) => {
        return <li key={index} className={classNames({
          [styles.square]: true,
          [styles.bgc]: item === '1',
        })} />;
      })
    }
  </ul>;
};

export default ChunkTooltip;

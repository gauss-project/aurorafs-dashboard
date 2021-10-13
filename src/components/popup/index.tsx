import React, { useState } from 'react';
import styles from './index.less';
import classNames from 'classnames';

type Props = {
  title?: string,
  visible: boolean,
  onCancel: () => void,
}
const Popup: React.FC<Props> = (props) => {
  const [full, setFull] = useState(false);
  const clickHandle = () => {
    setFull(!full);
  };
  return <>
    {
      props.visible &&
      <div className={styles.layer}>
        <div className={classNames({
          [styles.frame]: true,
          [styles.frameFull]: full,
        })}>
          <div className={styles.header}>
            <span>{props.title}</span>
            <div>
              <img src={full ? require('@/assets/icon/narrow.svg') : require('@/assets/icon/enlarge.svg')} alt={''}
                   onClick={clickHandle} />
              <img src={require('@/assets/icon/delete.svg')} onClick={props.onCancel} alt={'cancel'} />
            </div>
          </div>
          <div className={styles.content}>
            {props.children}
          </div>
        </div>
      </div>
    }
  </>;
};

export default Popup;

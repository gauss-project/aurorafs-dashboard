import React from 'react';
import videoSvg from '@/assets/icon/video.svg';
import folderSvg from '@/assets/icon/folder.svg';
import htmlSvg from '@/assets/icon/html.svg';
import pictureSvg from '@/assets/icon/picture.svg';
import textSvg from '@/assets/icon/text.svg';
import styles from './index.less';

type Props = {
  type: string,
  name: string,
}

const FileShow: React.FC<Props> = (props) => {
  let svg = props.type === 'dir' ? folderSvg :
    props.type === 'video' ? videoSvg :
      props.type === 'picture' ? pictureSvg :
        props.type === 'html' ? htmlSvg : textSvg;
  return <div className={styles.content}>
    <img src={svg} alt={'file'} />
    <div>
      {props.name}
    </div>
  </div>;
};

export default FileShow;

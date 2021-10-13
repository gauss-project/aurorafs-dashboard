import React, { ElementRef, useEffect, useRef } from 'react';
import styles from './index.less';
import Hls from 'hls.js';
import videoJs from 'video.js';
import 'video.js/dist/video-js.css';

import { message } from 'antd';

type Props = {
  src: string
}

const Video: React.FC<Props> = (props) => {
  const ele = useRef<any>(null);
  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(props.src);
      hls.attachMedia(ele.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        ele.current.play().catch((error: Error) => {
          //  when an exception is played, the exception flow is followed
        });
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        message.error('video loading failed');
      });
    }
  }, []);
  return <div className={styles.content}>
    <video id={'video'} ref={ele} width={'100%'} autoPlay controls />
  </div>;
};

export default Video;

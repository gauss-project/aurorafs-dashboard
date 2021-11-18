import React, { useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import { getChunkSource } from '@/api/debugApi';
import { useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import { AllFileInfo, ChunkSource } from '@/declare/api';

import { stringToBinary, getDownloadNumber } from '@/utils/util';
import ChunkTooltip from '@/components/chunkTooltip';
import classNames from 'classnames';

export declare type Props = {
  hashInfo: AllFileInfo;
};

export declare type Data = {
  overlay: string;
  chunkBit: {
    b: string;
    len: number;
  };
  downloadLen: number;
};

export const colorArr = [
  '#FFF',
  '#4147c4',
  '#ec808d',
  '#95f204',
  '#facd91',
  '#2468a2',
  '#5067c1',
];

const SourceInfo: React.FC<Props> = (props) => {
  const { fileHash: hash, size: len } = props.hashInfo;
  const { debugApi } = useSelector((state: Models) => state.global);
  const [showLimit, setShowLimit] = useState(true);
  const [source, setSource] = useState<Data[] | null>([]);
  const changeData = (data: ChunkSource) => {
    let arr: Data[] = [];
    data.chunkSource?.forEach((item, index) => {
      const binary = stringToBinary(item.chunkBit.b, item.chunkBit.len, 0);
      let downloadLen = getDownloadNumber(binary);
      console.log(item.overlay, data.pyramidSource);
      if (item.overlay === data.pyramidSource) {
        console.log(1);
        downloadLen += len;
      }
      item.chunkBit.len += len;
      let preIndex = index - 1;
      let current = {
        ...item,
        chunkBit: {
          len: item.chunkBit.len,
          b: binary,
        },
        downloadLen,
      };
      while (preIndex >= 0 && arr[preIndex].downloadLen < downloadLen) {
        arr[preIndex + 1] = arr[preIndex];
        preIndex--;
      }
      arr[preIndex + 1] = current;
    });
    return arr;
  };

  const getChunkArr = (data: Data[]) => {
    let chunkArr: number[] = [];
    let n = props.hashInfo.bitVector.len;
    console.log(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < data.length; j++) {
        chunkArr[i] = 0;
        if (data[j].chunkBit.b[i] === '1') {
          if (j >= 5) {
            chunkArr[i] = 6;
          } else {
            chunkArr[i] = j + 1;
          }
          break;
        }
      }
    }
    return new Array(len).fill(1).concat(chunkArr);
  };

  useEffect(() => {
    getChunkSource(debugApi, hash).then(({ data }) => {
      if (data.chunkSource) {
        setSource(changeData(data));
      } else {
        setSource(null);
      }
    });
  }, []);
  return (
    <>
      {source ? (
        <div className={styles.content}>
          <div className={styles.sources}>
            <h3>chunk source info</h3>
            <div className={styles.sourcesList}>
              {source.map((item, index) => {
                return (
                  <div
                    key={item.overlay}
                    className={classNames({
                      [styles.sourcesGrid]: true,
                      [styles.none]: index >= 5 ? showLimit : false,
                    })}
                  >
                    <div
                      style={{
                        width: 15,
                        height: 15,
                        backgroundColor:
                          index < 5 ? colorArr[index + 1] : colorArr[6],
                      }}
                    />
                    <div className={'greyColor'}>{item.overlay}</div>
                    <div>
                      {((item.downloadLen / item.chunkBit.len) * 100).toFixed(
                        2,
                      )}
                      %
                    </div>
                  </div>
                );
              })}
            </div>
            {source.length > 5 && (
              <span
                className={styles.showMore}
                onClick={() => {
                  setShowLimit(!showLimit);
                }}
              >
                {showLimit ? 'show more' : 'close'}
              </span>
            )}
          </div>
          <div className={styles.chunk}>
            {source?.length && <ChunkTooltip chunk={getChunkArr(source)} />}
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.chunk}>
            <ChunkTooltip
              chunk={props.hashInfo.bitVector.b
                .split('')
                .map((item) => parseInt(item))}
            />
          </div>
        </div>
      )}
    </>
  );
};
export default SourceInfo;

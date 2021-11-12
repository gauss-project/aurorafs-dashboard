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
      const downloadLen = getDownloadNumber(binary);
      if (!arr.length || arr[index - 1].downloadLen > downloadLen) {
        arr.push({
          ...item,
          chunkBit: {
            len: item.chunkBit.len + len,
            b: binary,
          },
          downloadLen,
        });
      } else {
        arr.unshift({
          ...item,
          chunkBit: {
            len: item.chunkBit.len + len,
            b: binary,
          },
          downloadLen,
        });
      }
    });
    return arr;
  };

  const getChunkArr = (data: Data[]) => {
    let chunkArr: number[] = [];
    let n = data[0].chunkBit.len;
    for (let i = 0; i < n - len; i++) {
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
    getChunkSource(debugApi, hash)
      .then(({ data }) => {
        if (data.chunkSource) {
          setSource(changeData(data));
        } else {
          setSource(null);
        }
      })
      .catch();
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
                        backgroundColor: colorArr[index + 1],
                      }}
                    />
                    <div>{item.overlay}</div>
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
        <div className={styles.chunk}>
          <ChunkTooltip
            chunk={new Array(
              props.hashInfo.size + props.hashInfo.bitVector.len,
            ).fill(1)}
          />
        </div>
      )}
    </>
  );
};
export default SourceInfo;

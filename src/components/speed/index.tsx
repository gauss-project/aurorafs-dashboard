import React, { useEffect, useState, memo, useRef } from 'react';
import { Chart } from '@antv/g2';
import { useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import moment from 'moment';
import { getSize } from '@/utils/util';
import styles from './index.less';

export declare type DataType = {
  time: string;
  category: string;
  speed: number;
};
const Speed: React.FC = () => {
  const { metrics } = useSelector((state: Models) => state.global);
  const createData = (n: number): DataType[] => {
    const timestamp = moment().valueOf();
    const arr: DataType[] = [];
    for (let i = 0; i < n; i++) {
      arr.push({
        time: moment(timestamp - (n - i - 1) * 15 * 1000)
          .utcOffset(480)
          .format('HH.mm.ss'),
        category: 'incomming',
        speed: 0,
      });
      arr.push({
        time: moment(timestamp - (n - i - 1) * 15 * 1000)
          .utcOffset(480)
          .format('HH.mm.ss'),
        category: 'outgoing',
        speed: 0,
      });
    }
    return arr;
  };
  const [data, setData] = useState<DataType[]>(createData(60));
  let chart = useRef<any>(null);
  const init = (data: DataType[]): void => {
    chart.current = new Chart({
      container: 'speed',
      autoFit: true,
      height: 400,
    });
    chart.current.data(data);

    chart.current.data(data);
    chart.current.scale({
      time: {
        nice: true,
        tickCount: 30,
      },
      speed: {
        nice: true,
      },
    });

    chart.current.tooltip({
      // showCrosshairs: true,
      shared: true,
    });

    chart.current.axis('speed', {
      label: {
        formatter: (val: string) => {
          return val + 'MB/s';
        },
      },
    });

    chart.current.axis('time', {
      label: {
        formatter: (val: string) => {
          return val.split('.').slice(0, -1).join('.');
        },
      },
    });

    chart.current
      .line()
      .position('time*speed')
      .color('category')
      .shape('smooth')
      .tooltip(
        'time*category*speed',
        function (time: number, category: string, speed: number) {
          return {
            name: category,
            value: getSize(speed * 1024 ** 2) + '/s',
          };
        },
      );

    chart.current
      .point()
      .position('time*speed')
      .color('category')
      .shape('circle');

    chart.current.render();
  };
  useEffect(() => {
    console.log(metrics);
    let newData: DataType[] = data.concat([
      {
        time: moment().utcOffset(480).format('HH.mm.ss'),
        category: 'incomming',
        speed: (metrics.downloadSpeed * 256) / 1024 / 15,
      },
      {
        time: moment().utcOffset(480).format('HH.mm.ss'),
        category: 'outgoing',
        speed: (metrics.uploadSpeed * 256) / 1024 / 15,
      },
    ]);
    newData.splice(0, 2);
    setData(newData);
  }, [metrics]);
  useEffect(() => {
    if (chart.current && data.length) {
      chart.current.changeData(data);
    } else {
      init(data);
    }
  }, [data]);
  return (
    <div className={styles.speed}>
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex' }}>
          <div
            className={styles.block}
            style={{ backgroundColor: '#5B8FF9' }}
          />
          <div>
            <div>
              <span className={styles.key}>incomming:</span>
              <span className={styles.value}>
                {getSize(metrics.downloadSpeed * 256 * 1024, 0)}/s
              </span>
            </div>
            <div>
              <span className={styles.key}>total:</span>
              <span className={styles.value}>
                {getSize(metrics.downloadTotal * 256, 1)}
              </span>
            </div>
          </div>
        </div>
        <div style={{ marginLeft: 100, display: 'flex' }}>
          <div
            className={styles.block}
            style={{ backgroundColor: '#5AD8A6' }}
          />
          <div>
            <div>
              <span className={styles.key}>outgoing:</span>
              <span className={styles.value}>
                {getSize(metrics.uploadSpeed * 256 * 1024, 0)}/s
              </span>
            </div>
            <div>
              <span className={styles.key}> total:</span>
              <span className={styles.value}>
                {getSize(metrics.uploadTotal * 256, 1)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div id="speed" />
    </div>
  );
};

export default memo(Speed);

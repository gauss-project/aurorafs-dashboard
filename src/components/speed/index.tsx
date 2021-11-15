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
  const { metrics, chartData, debugApi } = useSelector(
    (state: Models) => state.global,
  );
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
      .color('category', '#4147C4-#b8741a')
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
      .color('category', '#4147C4-#b8741a')
      .shape('circle')
      .tooltip(false);

    chart.current.render();
  };
  useEffect(() => {
    console.log(metrics);
    if (chart.current && chartData.length) {
      chart.current.changeData(chartData);
    } else {
      init(chartData);
    }
  }, [chartData]);
  return (
    <div className={styles.speed}>
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex' }}>
          <div
            className={styles.block}
            style={{ backgroundColor: '#4147C4' }}
          />
          <div>
            <div>
              <span className={styles.key}>retrieved:</span>
              <span className={styles.value}>
                {getSize(metrics.downloadSpeed * 256, 1)}/s
              </span>
            </div>
          </div>
        </div>
        <div style={{ marginLeft: 50, display: 'flex' }}>
          <div
            className={styles.block}
            style={{ backgroundColor: '#b8741a' }}
          />
          <div>
            <div>
              <span className={styles.key}>transferred:</span>
              <span className={styles.value}>
                {getSize(metrics.uploadSpeed * 256, 1)}/s
              </span>
            </div>
          </div>
        </div>
        <div style={{ marginLeft: 100 }}>
          <span className={styles.key}>retrievedTotal:</span>
          <span className={styles.value}>
            {getSize(metrics.downloadTotal * 256, 1)}
          </span>
        </div>
        <div style={{ marginLeft: 50 }}>
          <span className={styles.key}>transferredTotal:</span>
          <span className={styles.value}>
            {getSize(metrics.uploadTotal * 256, 1)}
          </span>
        </div>
      </div>
      <div id="speed" />
    </div>
  );
};

export default memo(Speed);

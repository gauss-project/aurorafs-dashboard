import React, { useEffect, useState, memo, useRef } from 'react';
import { Chart } from '@antv/g2';
import { useSelector } from 'umi';
import { Models } from '@/declare/modelType';
import moment from 'moment';
import { getSize } from '@/utils/util';
import styles from './index.less';
import debugApi from '@/api/debugApi';
import { speedTime } from '@/config/url';

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
        // nice: true,
        tickCount: 10,
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
          // return val.split('.').slice(0, -1).join('.');
          return val;
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
    chart.current.animate(false);
    chart.current.render();
  };
  useEffect(() => {
    if (chart.current && chartData.length) {
      chart.current.changeData(chartData);
    } else {
      init(chartData);
    }
    // sessionStorage.setItem(debugApi, JSON.stringify(chartData));
  }, [chartData]);
  return (
    <div className={styles.speed}>
      <div
        style={{
          display: 'flex',
          marginBottom: 25,
          justifyContent: 'flex-end',
        }}
      >
        <div className={'mainColor'} style={{ display: 'flex' }}>
          <div
            className={styles.block}
            style={{ backgroundColor: '#4147C4' }}
          />
        </div>
        <div className={'mainColor'}>
          <span className={styles.key}>Retrieved:</span>
          <span className={styles.value}>
            {getSize(metrics.downloadTotal * 256, 1)}
          </span>
        </div>
        <div
          className={'uploadColor'}
          style={{ marginLeft: 50, display: 'flex' }}
        >
          <div
            className={styles.block}
            style={{ backgroundColor: '#b8741a' }}
          />
        </div>
        <div className={'uploadColor'}>
          <span className={styles.key}>Transferred:</span>
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

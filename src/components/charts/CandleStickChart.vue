<template>
  <div class="chart">
    <div
      ref="chart"
      style="width: 100%; height: 350px"
    />
  </div>
</template>

<script>
import moment from 'moment';
import * as echarts from 'echarts';
import { fetchJson } from '../../lib/utils';

export default {
  name: 'CandleStickChart',
  async mounted() {
    this.$charts = echarts.init(this.$refs.chart);
    console.info('========================');
    console.info('echarts ::', echarts);
    console.info('========================');
    this.initChart(1);
  },
  methods: {
    async initChart(days = 1) {
      this.activeRangeType = days;
      // this.$charts.showLoading();
      function calculateMA(dayCount, data) {
        const result = [];
        // eslint-disable-next-line no-plusplus
        for (let i = 0, len = data.length; i < len; i++) {
          if (i < dayCount) {
            result.push('-');
            // eslint-disable-next-line no-continue
            continue;
          }
          let sum = 0;
          // eslint-disable-next-line no-plusplus
          for (let j = 0; j < dayCount; j++) {
            sum += +data[i - j][1];
          }
          result.push(sum / dayCount);
        }
        return result;
      }
      try {
        const rawData = await fetchJson('https://api.coingecko.com/api/v3/coins/aeternity/ohlc?days=7&vs_currency=usd');
        console.info('========================');
        console.info('initChart.rawData ::', rawData);
        console.info('========================');

        const dates = rawData.map((item) => moment(item[0]).format('lll'));
        const data = rawData.map((item) => [item[1], item[4], item[2], item[3]]);
        // const data = rawData.map((item) => [+item[1], +item[2], +item[3], +item[4]]);
        // const data = rawData.map((item) => [+item[1], +item[2], +item[5], +item[6]]);

        this.$charts.setOption({
          title: {
            text: 'AE',
            left: 0,
          },
          legend: {
            data: ['AE', 'MA5', 'MA10', 'MA20', 'MA30'],
            inactiveColor: '#777',
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              animation: false,
              type: 'cross',
              lineStyle: {
                color: '#376df4',
                width: 2,
                opacity: 1,
              },
            },
          },
          xAxis: {
            type: 'category',
            data: dates,
            axisLine: { lineStyle: { color: '#8392A5' } },
          },
          yAxis: {
            scale: true,
            axisLine: { lineStyle: { color: '#8392A5' } },
            splitLine: { show: false },
          },
          grid: {
            bottom: 80,
          },
          dataZoom: [
            {
              textStyle: {
                color: '#8392A5',
              },
              // handleIcon:
              //   'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
              dataBackground: {
                areaStyle: {
                  color: '#8392A5',
                },
                lineStyle: {
                  opacity: 0.8,
                  color: '#8392A5',
                },
              },
              brushSelect: true,
            },
            {
              type: 'inside',
            },
          ],
          series: [
            {
              type: 'candlestick',
              name: 'Day',
              data,
              itemStyle: {
                color: '#0CF49B',
                color0: '#FD1050',
                borderColor: '#0CF49B',
                borderColor0: '#FD1050',
              },
            },
            {
              name: 'MA5',
              type: 'line',
              data: calculateMA(5, data),
              smooth: true,
              showSymbol: false,
              lineStyle: {
                width: 1,
              },
            },
            {
              name: 'MA10',
              type: 'line',
              data: calculateMA(10, data),
              smooth: true,
              showSymbol: false,
              lineStyle: {
                width: 1,
              },
            },
            {
              name: 'MA20',
              type: 'line',
              data: calculateMA(20, data),
              smooth: true,
              showSymbol: false,
              lineStyle: {
                width: 1,
              },
            },
            {
              name: 'MA30',
              type: 'line',
              data: calculateMA(30, data),
              smooth: true,
              showSymbol: false,
              lineStyle: {
                width: 1,
              },
            },
          ],
        });
      } catch (error) {
        //
      }

      // this.$charts.hideLoading();

      // $charts.on('mouseover', 'series', (item) => {
      //   if (item.data.length) {
      //     const option = $charts.getOption();
      //     console.info('========================');
      //     console.info('mouseover series::', item);
      //     console.info('option::', option);
      //     console.info('========================');
      //     option.title[0].text = `${item.data[item.data.length - 1]} (${item.name})`;
      //     $charts.setOption(option);
      //   }
      // });
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables.scss';
@use '../../styles/typography.scss';
.chart {
  background-color: variables.$color-black2;
  min-height: 150px;
  width: 100%;
  padding: 12px;
  border-radius: 12px;

  strong {
    @extend %face-sans-14-regular;
    color: variables.$color-gray2;
  }

  h3 {
    line-height: 2px;
  }
}
</style>

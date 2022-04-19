<template>
  <div class="chart">
    <div
      ref="chart"
      style="width: 100%; height: 350px"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'LineChart',
  mounted() {
    console.info('========================');
    console.info('echarts ::', echarts);
    console.info('========================');

    let base = +new Date(1968, 9, 3);
    const oneDay = 24 * 3600 * 1000;
    const date = [];
    const data = [Math.random() * 300];
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < 20000; i++) {
      const now = new Date((base += oneDay));
      date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
      data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
    }

    const myChart = echarts.init(this.$refs.chart);
    // const myChart = new Chart(
    //   this.$refs.chart,
    //   config,
    // );
    // Draw the chart
    myChart.setOption({
      tooltip: {
        trigger: 'axis',
        position: (pt) => [pt[0], '10%'],
      },
      title: {
        left: 'center',
        text: 'Large Area Chart',
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none',
          },
          restore: {},
          saveAsImage: {},
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: date,
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 10,
        },
        {
          start: 0,
          end: 10,
        },
      ],
      series: [
        {
          name: 'Fake Data',
          type: 'line',
          symbol: 'none',
          sampling: 'lttb',
          itemStyle: {
            color: 'rgb(255, 70, 131)',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgb(255, 158, 68)',
              },
              {
                offset: 1,
                color: 'rgb(255, 70, 131)',
              },
            ]),
          },
          data,
        },
      ],
    });

    console.info('========================');
    console.info('myChart ::', myChart);
    console.info('========================');
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
  flex: 0.5;
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

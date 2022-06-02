<template>
  <div class="chart">
    <strong>TVL</strong>
    <h3>$10.22b</h3>
    <canvas
      ref="chart"
      width="100%"
      height="100px"
    />
  </div>
</template>

<script>
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle,
} from 'chart.js';

export default {
  name: 'LineChart',
  mounted() {
    Chart.register(
      ArcElement,
      LineElement,
      BarElement,
      PointElement,
      BarController,
      BubbleController,
      DoughnutController,
      LineController,
      PieController,
      PolarAreaController,
      RadarController,
      ScatterController,
      CategoryScale,
      LinearScale,
      LogarithmicScale,
      RadialLinearScale,
      TimeScale,
      TimeSeriesScale,
      Decimation,
      Filler,
      Legend,
      Title,
      Tooltip,
      SubTitle,
    );

    console.info('========================');
    console.info('Chart ::', Chart);
    console.info('========================');
    const labels = [];
    const data = [];
    const getRandomInt = (_min, _max) => {
      const min = Math.ceil(_min);
      const max = Math.floor(_max);
      return Math.floor(Math.random() * (max - min) + min);
    };

    // eslint-disable-next-line no-plusplus
    for (let index = 1; index < 30; index++) {
      labels.push(index);
      data.push(getRandomInt(10, 100));
    }
    const config = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'TVL',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data,
          },
        ],
      },
      options: {},
    };

    const myChart = new Chart(
      this.$refs.chart,
      config,
    );

    console.info('========================');
    console.info('myChart ::', myChart);
    console.info('Chart ::', Chart);
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

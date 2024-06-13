<template>
  <div class="flex gap-2">
    <ButtonDefault
      v-for="time in labels"
      :key="time"
      class="p-16 block"
      fill="light"
      @click="changeChartContent(time)"
    >
      {{ time }}
    </ButtonDefault>
  </div>
  <Line :data="graphData" :options="options" />
  <div class="flex gap-2">
    <ButtonDefault
      v-for="time in Object.keys(timeFrames)"
      :key="time"
      class="p-10 block w-12"
      fill="light"
      @click="changeTimeFrame(time)"
    >
      {{ time }}
    </ButtonDefault>
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'vue-chartjs';
import 'chartjs-adapter-date-fns';
import ButtonDefault from '@/components/ButtonDefault.vue';

const TIME_FRAMES = {
  '1H': 1,
  '1D': 24,
  '1W': 24 * 7,
  '1M': 24 * 30,
  '1Y': 24 * 365,
  MAX: Infinity,
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  LineElement,
);

export default {
  name: 'PriceHistoryGraph',
  components: {
    ButtonDefault,
    Line,
  },
  props: {
    datasets: { type: Array, required: true },
    x: { type: Array, required: true },
  },
  data() {
    return {
      selectedTimeFrame: 'MAX',
      selectedChart: 'Volume',
      colors: ['red', 'green', 'blue', 'purple', 'orange'],
      timeFrames: TIME_FRAMES,
      options: {
        legend: {
          labels: {
            fontColor: 'blue',
            fontSize: 18,
          },
        },
        responsive: true,
        scales: {
          x: {
            type: 'time',
          },
          y: {
            ticks: {
              // Include a dollar sign in the ticks
              callback: this.yTickCallback,
            },
          },
        },
      },
    };
  },
  computed: {
    labels() {
      return this.datasets.map((d) => d.label);
    },
    graphData() {
      // filter data based on selected time
      const filteredX = this.x.filter(
        (d) => d > Date.now() - 1000 * 60 * 60 * this.timeFrames[this.selectedTimeFrame],
      );
      const selectedDataSet = this.datasets.find((d) => d.label === this.selectedChart);
      const filteredData = selectedDataSet.data.filter(
        (_, i) => this.x[i] > Date.now() - 1000 * 60 * 60 * this.timeFrames[this.selectedTimeFrame],
      );

      return {
        labels: filteredX.map((x) => Number(x)),
        datasets: [
          {
            label: selectedDataSet.label,
            data: filteredData.map((y) => Number(y)),
            borderColor: 'rgb(0 255 157 / 80%)',
            fill: false,
            tension: 0.0,
          },
        ],
      };
    },
  },
  methods: {
    changeTimeFrame(newTimeFrame) {
      this.selectedTimeFrame = newTimeFrame;
    },
    changeChartContent(newChart) {
      this.selectedChart = newChart;
    },
    yTickCallback(value) {
      return ['TVL', 'Fees', 'Volume'].includes(this.selectedChart) ? `$${value}` : value;
    },
  },
};
</script>

<style lang="scss" scoped>
.button-default {
  padding: 5px 10px;
  border-radius: 25px;
}
</style>

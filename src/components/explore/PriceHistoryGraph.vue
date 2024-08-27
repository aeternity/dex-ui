<template>
  <div v-if="labels.length > 1" class="flex gap-2 mb-3">
    <ButtonDefault
      v-for="label in labels"
      :key="label"
      class="p-16 hidden md:block"
      :fill="label === selectedChart ? 'light' : 'transparent'"
      @click="changeChartContent(label)"
    >
      {{ label }}
    </ButtonDefault>
    <div class="border border-gray-800 p-2 md:hidden rounded-xl">
      <label for="chart-select" class="hidden">Select Option</label>
      <select
        id="chart-select"
        v-model="selectedChart"
        class="block bg-transparent text-white outline-0"
        @change="changeChartContent($event.target.value)"
      >
        <option v-for="label in labels" :key="label" :value="label" class="bg-gray-800">
          {{ label }}
        </option>
      </select>
    </div>
  </div>
  <div class="relative">
    <Bar v-if="showBar" :data="graphData" :options="options" />
    <Line v-else :data="graphData" :options="options" />
    <div
      v-if="loading"
      class="absolute flex justify-center items-center w-full h-full top-0 left-0 text-3xl"
      @click.prevent
    >
      Loading...
    </div>
    <div
      v-if="showNoData && !loading"
      class="absolute flex justify-center items-center w-full h-full top-0 left-0 text-3xl"
      @click.prevent
    >
      No Data
    </div>
  </div>

  <div class="flex gap-2 mt-3">
    <ButtonDefault
      v-for="time in Object.keys(timeFrames)"
      :key="time"
      class="p-10 block w-14"
      :fill="time === selectedTimeFrame ? 'light' : 'transparent'"
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
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'vue-chartjs';
import 'chartjs-adapter-date-fns';
import ButtonDefault from '@/components/ButtonDefault.vue';
import BigNumber from 'bignumber.js';

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
  BarElement,
);

export default {
  name: 'PriceHistoryGraph',
  components: {
    ButtonDefault,
    Line,
    Bar,
  },
  props: {
    availableGraphTypes: { type: Array, required: true },
    datasets: { type: Array, required: true },
    x: { type: Array, required: true },
    initialChart: { type: String, default: 'Volume' },
    initialTimeFrame: { type: String, default: 'MAX' },
  },
  data() {
    return {
      selectedTimeFrame: null,
      selectedChart: null,
      colors: ['red', 'green', 'blue', 'purple', 'orange'],
      timeFrames: TIME_FRAMES,
      graph: {
        labels: [],
        datasets: [],
      },
      loading: false,
    };
  },
  computed: {
    showNoData() {
      return (
        !this.graphData?.datasets?.[0]?.data?.length ||
        this.graphData?.datasets?.[0]?.data?.every((d) => d === 0)
      );
    },
    options() {
      return {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            type: 'time',
            offset: true,
            min: Math.max(
              Date.now() - 1000 * 60 * 60 * this.timeFrames[this.selectedTimeFrame],
              this.graph.labels[0],
            ),
            max: Date.now(),
          },
          y: {
            ticks: {
              // Include a dollar sign in the ticks
              callback: (value) =>
                ['TVL', 'Fees', 'Volume'].includes(this.selectedChart) ? `$${value}` : value,
            },
          },
        },
      };
    },
    labels() {
      return this.availableGraphTypes;
    },
    graphData() {
      return {
        labels: this.graph.labels.map((l) => Number(l)),
        datasets: this.graph.datasets.map((d) => ({
          label: d.label,
          data: d.data.map((d) => Number(d)),
          borderColor: 'rgb(0 255 157 / 80%)',
          backgroundColor: 'rgb(0 255 157 / 80%)',
        })),
      };
    },
    showBar() {
      return ['TVL', 'Volume', 'Fees', 'Locked'].includes(this.selectedChart);
    },
  },
  async mounted() {
    this.fetchData();
  },
  created() {
    this.selectedTimeFrame = this.initialTimeFrame;
    this.selectedChart = this.initialChart;
  },
  methods: {
    changeTimeFrame(newTimeFrame) {
      this.selectedTimeFrame = newTimeFrame;
      this.fetchData();
    },
    changeChartContent(newChart) {
      this.selectedChart = newChart;
    },
    async fetchData() {
      this.loading = true;
      this.graph.datasets = [];
      this.graph = await this.$store.dispatch('backend/fetchGraph', {
        graphType: this.selectedChart,
        timeFrame: this.selectedTimeFrame,
      });
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.button-default {
  padding: 5px 10px;
  border-radius: 25px;
}

option,
optgroup {
  -webkit-appearance: none;
}
</style>

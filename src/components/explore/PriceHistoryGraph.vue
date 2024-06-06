<template>
  <Line :data="data" :options="options" />
  <div class="flex gap-2">
    <ButtonDefault
      v-for="time in Object.keys(timeFrames)"
      :key="time"
      class="p-6 block"
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
    priceData: { type: Array, required: true },
  },
  data() {
    return {
      selectedTimeFrame: 'MAX',
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
        },
      },
    };
  },
  computed: {
    data() {
      // filter data based on selected time
      const filteredData = this.priceData.filter(
        (d) => d.x > Date.now() - 1000 * 60 * 60 * this.timeFrames[this.selectedTimeFrame],
      );

      return {
        labels: filteredData.map((d) => Number(d.x)),
        datasets: [
          {
            label: 'Price',
            data: filteredData.map((d) => d.y),
            borderColor: 'rgb(0 255 157 / 80%)',
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
          },
        ],
      };
    },
  },
  methods: {
    changeTimeFrame(newTimeFrame) {
      this.selectedTimeFrame = newTimeFrame;
    },
  },
};
</script>

<style lang="scss" scoped>
.button-default {
  padding: 5px;
  border-radius: 25px;
  width: 50px;
}
</style>

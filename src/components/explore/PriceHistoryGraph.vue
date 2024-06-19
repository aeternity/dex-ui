<template>
  <div v-if="labels.length > 1" class="flex gap-2 mb-3">
    <ButtonDefault
      v-for="label in labels"
      :key="label"
      class="p-16 block"
      :fill="label === selectedChart ? 'light' : 'transparent'"
      @click="changeChartContent(label)"
    >
      {{ label }}
    </ButtonDefault>
  </div>
  <div class="relative">
    <Bar v-if="showBar" :data="graphData" :options="options" />
    <Line v-else :data="graphData" :options="options" />
    <div
      v-if="showNoData"
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
              this.filteredData.filteredTime[0],
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
      return this.datasets.map((d) => d.label);
    },
    filteredData() {
      const selectedDataSet = this.datasets.find((d) => d.label === this.selectedChart);
      return {
        filteredData: selectedDataSet.data
          .filter(
            (_, i) =>
              this.x[i] > Date.now() - 1000 * 60 * 60 * this.timeFrames[this.selectedTimeFrame],
          )
          .filter((d) => !new BigNumber(d).isNaN()),
        filteredTime: this.x
          .filter((d) => d > Date.now() - 1000 * 60 * 60 * this.timeFrames[this.selectedTimeFrame])
          .map((d) => Number(d)),
        selectedDataSet,
      };
    },
    graphData() {
      // filter data based on selected time
      const { filteredTime, filteredData, selectedDataSet } = this.filteredData;
      if (
        (filteredData.length === 0 || filteredTime.length === 0 || !selectedDataSet) &&
        (this.selectedChart === 'Fees' || this.selectedChart === 'Volume')
      ) {
        return {
          labels: [],
          datasets: [],
        };
      }

      // aggregate data based on selected time
      // retrieve min time from data or default to selected view
      const minTime =
        filteredTime.length > 0
          ? Math.min(...filteredTime)
          : Date.now() - 1000 * 60 * 60 * this.timeFrames[this.selectedTimeFrame];

      if (['TVL', 'Volume', 'Fees', 'Locked'].includes(this.selectedChart)) {
        // these three charts are bar charts, so we need to calculate buckets
        const bucketSize = (Date.now() - minTime) / 30;

        // seed empty buckets
        const emptyBuckets = Object.fromEntries(
          Array.from({ length: 31 }).map((_, i) => {
            const key = minTime + i * bucketSize;
            return [key, []];
          }),
        );

        // deal with no data in current time frame
        if (Object.keys(filteredData).length === 0 && selectedDataSet.data.length > 0) {
          filteredTime.push(minTime);
          filteredData.push(selectedDataSet.data[selectedDataSet.data.length - 1]);
        }

        const aggregatedData = filteredData.reduce((acc, d, i) => {
          const time = filteredTime[i];
          const bucketIndex = Math.floor((time - minTime) / bucketSize);
          const key = minTime + bucketIndex * bucketSize;
          acc[key].push(d);
          return acc;
        }, emptyBuckets);
        let bucketedData;
        // interpolate TVL
        if (['TVL', 'Locked'].includes(this.selectedChart)) {
          // average TVL
          let prevArr = [];
          bucketedData = Object.fromEntries(
            Object.entries(aggregatedData).map(([time, bucketArr], index) => {
              let aggregatedValue = bucketArr
                .reduce((acc, v) => acc.plus(v), new BigNumber(0))
                .div(bucketArr.length);
              // interpolate TVL by filling in missing data with latest value from previous bucket
              if (index > 0 && aggregatedValue.isNaN()) {
                aggregatedValue = prevArr[prevArr.length - 1];
              } else {
                prevArr = [...bucketArr];
              }
              return [time, aggregatedValue];
            }),
          );

          // deal with empty filteredData
        } else {
          // sum fees and volume
          bucketedData = Object.fromEntries(
            Object.entries(aggregatedData).map(([time, bucketArr]) => [
              time,
              bucketArr.reduce((acc, v) => acc.plus(v), new BigNumber(0)),
            ]),
          );
        }
        return {
          labels: Object.keys(bucketedData).map((x) => Number(x)),
          datasets: [
            {
              label: selectedDataSet.label,
              data: Object.values(bucketedData).map((y) => Number(y)),
              borderColor: 'rgb(0 255 157 / 80%)',
              backgroundColor: 'rgb(0 255 157 / 80%)',
            },
          ],
        };
      }
      // Prices should be interpolated
      if (filteredData.length === 0 && selectedDataSet.data.length > 0) {
        filteredTime.push(minTime);
        filteredData.push(selectedDataSet.data[selectedDataSet.data.length - 1]);
      }

      return {
        labels: [...filteredTime.map((x) => Number(x)), Date.now()],
        datasets: [
          {
            label: selectedDataSet.label,
            data: [...filteredData, filteredData[filteredData.length - 1]].map((y) => Number(y)),
            borderColor: 'rgb(0 255 157 / 80%)',
            backgroundColor: 'rgb(0 255 157 / 80%)',
          },
        ],
      };
    },
    showBar() {
      return ['TVL', 'Volume', 'Fees', 'Locked'].includes(this.selectedChart);
    },
  },
  created() {
    this.selectedTimeFrame = this.initialTimeFrame;
    this.selectedChart = this.initialChart;
  },
  methods: {
    changeTimeFrame(newTimeFrame) {
      this.selectedTimeFrame = newTimeFrame;
    },
    changeChartContent(newChart) {
      this.selectedChart = newChart;
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

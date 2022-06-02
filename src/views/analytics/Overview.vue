<template>
  <div class="analytics">
    <div class="charts">
      <div class="box">
        <LineChart />
      </div>

      <div class="box">
        <LineChart />
      </div>
    </div>

    <div class="volume-info">
      <span class="white">Volume 24H:</span>
      <span class="white">$1.37b</span>
      <span class="green percentage">(↑152.49%)</span>

      <span class="white">Fees 24H:</span>
      <span class="white">$1.79m</span>
      <span class="green percentage">(↑99.33%)</span>

      <span class="white">TVL:</span>
      <span class="white">$4.66b</span>
      <span class="red percentage">(↓2.70%)</span>
    </div>

    <div class="block">
      <div class="heading">
        <div>
          Top Tokens
        </div>

        <router-link
          to="/analytics/tokens"
        >
          Explore
        </router-link>
      </div>
      <TokenTable />
    </div>

    <div class="block">
      <div class="heading">
        <div>
          Top Pairs
        </div>

        <router-link
          to="/analytics/pools"
        >
          Explore
        </router-link>
      </div>
      <PairTable />
    </div>
  </div>
</template>

<script>
import TokenTable from '../../components/analytics/TokenTable.vue';
import PairTable from '../../components/analytics/PairTable.vue';
import LineChart from '../../components/charts/LineChart.vue';

export default {
  name: 'ChartsOverview',
  components: {
    TokenTable,
    PairTable,
    LineChart,
  },
};
</script>

<style lang="scss" scoped>
  @use '../../styles/variables.scss';
  @use '../../styles/typography.scss';
  @use '../../styles/analytics.scss';

  .analytics {
    text-align: left;
    .charts {
      display: inline-flex;
      width: 100%;
      .box {
        margin: 12px;
        flex: 0.5;
      }
    }

    .volume-info {
      background-color: variables.$color-black2;
      border-radius: 12px;
      padding: 12px;
      margin: 6px 12px;

      @extend %face-sans-14-regular;

      span {
        margin-right: 5px;
        color: variables.$color-gray2;

        &.percentage {
          margin-right: 15px;
        }

        &.white {
          color: variables.$color-white;
        }

        &.red {
          color: variables.$color-red;
        }

        &.green {
          color: variables.$color-green;
        }
      }
    }
  }
</style>

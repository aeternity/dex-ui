<template>
  <div class="token-detail">
    <div class="header">
      <div class="token">
        <div class="token-heading">
          <img
            class="token-img"
            :src="token.image ?? `https://avatars.z52da5wt.xyz/${token.address}`"
          >
          <div class="token-info">
            <span class="token-name">
              {{ token.name }}
            </span>
            <span class="token-symbol">
              ({{ token.symbol }})
            </span>
          </div>
        </div>
        <br>
        <div class="token-price">
          <h3>$3.04k</h3>
          (<span>5.23%</span>)
        </div>
      </div>

      <div>
        <ButtonDefault
          class="header-button"
        >
          Add Liquidity
        </ButtonDefault>

        <ButtonDefault
          class="header-button"
        >
          Trade
        </ButtonDefault>
      </div>
    </div>

    <div class="charts">
      <div class="block">
        Hello
      </div>
      <div class="chart-finance">
        <CandleStickChart />
      </div>
    </div>
  </div>
</template>

<script>
import { fetchJson } from '../../lib/utils';
import ButtonDefault from '../../components/ButtonDefault.vue';
import CandleStickChart from '../../components/charts/CandleStickChart.vue';

export default {
  name: 'TokenDetailView',
  components: {
    ButtonDefault,
    CandleStickChart,
  },
  data() {
    return {
      token: {},
    };
  },
  async mounted() {
    this.token = await fetchJson(`http://localhost:3000/tokens/${this.$route.params.address}`);
  },
};
</script>

<style lang="scss" scoped>
  @use '../../styles/overview.scss';
  @use '../../styles/typography.scss';
  @use '../../styles/variables.scss';

  .token-detail {
    text-align: left;
    width: 100%;
    .header {
      width: 100%;
      display: inline-flex;
      justify-content: space-between;
      align-items: center;

      .token {
        display: block;
        .token-heading {
          display: inline-flex;
          align-items: center;
          img {
            width: 32px;
            height: 32px;
            border-radius: 24px;
            margin-right: 8px;
          }

          .token-info {
            @extend %face-sans-18-regular;

            .token-symbol {
              @extend %face-sans-16-regular;
            }
          }
        }

        .token-price {
          display: inline-flex;
          align-items: center;

          h3 {
            @extend %face-sans-18-medium;

            margin-right: 8px;
          }

          span {
            @extend %face-sans-14-regular;

            color: variables.$color-green;
          }
        }
      }

      .header-button {
        padding: 8px 16px;
        margin-left: 8px;
      }
    }

    .charts {
      width: 100%;
      display: inline-flex;
      .block {
        background-color: variables.$color-black2;
        min-height: 150px;
        flex: 0.3;
        padding: 12px;
        border-radius: 12px;
        margin: 6px;
      }
      .chart-finance {
        flex: 0.7;
        margin: 6px;
      }
    }
  }

</style>

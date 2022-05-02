<template>
  <div
    v-if="token"
    class="token-detail"
  >
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
        <div
          v-if="tokenInfo.current_price"
          class="token-price"
        >
          <h3>
            {{ tokenPriceFormat(tokenInfo.current_price) }}
          </h3>
          ( <span :class="['percentage', 'px', {red: aeCoin.price_change_percentage_24h < 0}]">
            {{ Number(aeCoin.price_change_percentage_24h).toFixed(2) }}%
          </span> )

          <span :class="['percentage', 'px', {red: aeCoin.price_change_percentage_24h < 0}]">
            {{ tokenInfo.price_change_24h < 0 ? ' ' : ' -' }}
            {{ tokenPriceFormat(tokenInfo.price_change_24h) }}
          </span>
        </div>
      </div>

      <div>
        <ButtonDefault
          class="header-button"
          @click.prevent="$router.push({
            name: 'add-pool',
            query: {
              from: $route.params.address
            }
          })"
        >
          Add Liquidity
        </ButtonDefault>

        <ButtonDefault
          class="header-button"
          @click.prevent="$router.push({
            name: 'swap',
            query: {
              from: $route.params.address
            }
          })"
        >
          Trade
        </ButtonDefault>
      </div>
    </div>

    <div class="charts">
      <div class="block">
        <div
          v-if="tokenInfo.market_cap"
          class="item"
        >
          <div class="title">
            Market Cap
          </div>
          <div class="price">
            {{ tokenPriceFormat(tokenInfo.market_cap) }}
          </div>
        </div>

        <div
          v-if="tokenInfo.total_volume"
          class="item"
        >
          <div class="title">
            Total Volume
          </div>
          <div class="price">
            {{ tokenPriceFormat(tokenInfo.total_volume) }}
          </div>
        </div>

        <div
          v-if="tokenInfo.high_24h"
          class="item"
        >
          <div class="title">
            High 24h
          </div>
          <div class="price">
            {{ tokenPriceFormat(tokenInfo.high_24h) }}
          </div>
        </div>

        <div
          v-if="tokenInfo.low_24h"
          class="item"
        >
          <div class="title">
            Low 24h
          </div>
          <div class="price">
            {{ tokenPriceFormat(tokenInfo.low_24h) }}
          </div>
        </div>

        <div class="item">
          <div class="title">
            24h Trading Vol
          </div>
          <div class="price">
            {{ tokenPriceFormat(tokenInfo.market_cap_change_24h) }}
          </div>
          <div :class="['percentage', {red: aeCoin.market_cap_change_percentage_24h < 0}]">
            {{ Number(aeCoin.market_cap_change_percentage_24h).toFixed(2) }}%
          </div>
        </div>
      </div>
      <div class="chart-finance">
        <CandleStickChart :ratio="ratio" />
      </div>
    </div>

    <div class="block">
      <div class="heading">
        <div>
          Pools
        </div>
      </div>
      <PairTable
        :token="token"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import { formatCurrency } from '@coingecko/cryptoformat';
import { fetchJson, reduceDecimals } from '../../lib/utils';
import ButtonDefault from '../../components/ButtonDefault.vue';
import CandleStickChart from '../../components/charts/CandleStickChart.vue';
import PairTable from '../../components/analytics/PairTable.vue';

export default {
  name: 'TokenDetailView',
  components: {
    ButtonDefault,
    CandleStickChart,
    PairTable,
  },
  data() {
    return {
      token: null,
      pairs: null,
    };
  },
  computed: {
    ...mapState('analytics', ['aeCoin']),
    ratio() {
      if (!this.token || !this.pairs || !this.pairs.pairs0) {
        return null;
      }
      const WAE_ADDRESS = 'ct_JDp175ruWd7mQggeHewSLS1PFXt9AzThCDaFedxon8mF8xTRF';

      let WAE = this.pairs.pairs0.find((pair) => pair.oppositeToken.address === WAE_ADDRESS);

      if (!WAE) {
        WAE = this.pairs.pairs1.find((pair) => pair.oppositeToken.address === WAE_ADDRESS);
      }

      if (!WAE) {
        return null;
      }

      return reduceDecimals(WAE.liquidityInfo.reserve0, this.token.decimals)
        .div(reduceDecimals(WAE.liquidityInfo.reserve1, WAE.oppositeToken.decimals)).toNumber();
    },
    tokenInfo() {
      if (!this.ratio || !this.aeCoin) return {};
      return {
        // market_cap_change_24h
        current_price: BigNumber(this.aeCoin.current_price).div(this.ratio),
        price_change_24h: BigNumber(this.aeCoin.price_change_24h).div(this.ratio),
        market_cap: BigNumber(this.aeCoin.market_cap).div(this.ratio),
        total_volume: BigNumber(this.aeCoin.total_volume).div(this.ratio),
        high_24h: BigNumber(this.aeCoin.high_24h).div(this.ratio),
        low_24h: BigNumber(this.aeCoin.low_24h).div(this.ratio),
        market_cap_change_24h: BigNumber(this.aeCoin.market_cap_change_24h).div(this.ratio),
      };
    },
  },
  async mounted() {
    const [
      token,
      pairs,
    ] = await Promise.all([
      fetchJson(`http://localhost:3000/tokens/${this.$route.params.address}`),
      fetchJson(`http://localhost:3000/tokens/${this.$route.params.address}/pairs`),
    ]);

    this.token = token;
    this.pairs = pairs;
  },
  methods: {
    tokenPriceFormat(price) {
      return formatCurrency(price, 'USD', 'en');
    },
  },
};
</script>

<style lang="scss" scoped>
  @use '../../styles/analytics.scss';
  @use '../../styles/typography.scss';
  @use '../../styles/variables.scss';

  .token-detail {
    text-align: left;
    width: 100%;
    .percentage {
      @extend %face-sans-14-regular;

      color: variables.$color-green;

      &.red {
        color: variables.$color-red;
      }

      &.px {
        padding: 0 5px;
      }
    }

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
            @extend %face-sans-20-medium;

            margin-right: 8px;
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

      .item {
        margin-bottom: 18px;

        .title {
          @extend %face-sans-16-regular;
        }

        .price {
          @extend %face-sans-18-medium;

          padding: 8px 0;
        }
      }
    }
  }

</style>

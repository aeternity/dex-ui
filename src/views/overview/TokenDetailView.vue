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
          v-if="tokenHistory.current_price"
          class="token-price"
        >
          <h3>
            {{ tokenPriceFormat(tokenHistory.current_price) }}
          </h3>
          ( <span :class="['percentage', {red: tokenHistory.price_change_percentage_24h < 0}]">
            {{ Number(tokenHistory.price_change_percentage_24h).toFixed(2) }}%
          </span> )

          <span :class="['percentage', {red: tokenHistory.price_change_percentage_24h < 0}]">
            . + {{ tokenPriceFormat(tokenHistory.price_change_24h) }}
          </span>
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
        <div
          v-if="tokenHistory.market_cap"
          class="item"
        >
          <div class="title">
            Market Cap
          </div>
          <div class="price">
            {{ tokenPriceFormat(tokenHistory.market_cap) }}
          </div>
        </div>

        <div
          v-if="tokenHistory.total_volume"
          class="item"
        >
          <div class="title">
            Total Volume
          </div>
          <div class="price">
            {{ tokenPriceFormat(tokenHistory.total_volume) }}
          </div>
        </div>

        <div
          v-if="tokenHistory.high_24h"
          class="item"
        >
          <div class="title">
            High 24h
          </div>
          <div class="price">
            {{ tokenPriceFormat(tokenHistory.high_24h) }}
          </div>
        </div>

        <div
          v-if="tokenHistory.low_24h"
          class="item"
        >
          <div class="title">
            Low 24h
          </div>
          <div class="price">
            {{ tokenPriceFormat(tokenHistory.low_24h) }}
          </div>
        </div>

        <div class="item">
          <div class="title">
            24h Trading Vol
          </div>
          <div class="price">
            {{ tokenPriceFormat(tokenHistory.market_cap_change_24h) }}
          </div>
          <div :class="['percentage', {red: tokenHistory.market_cap_change_percentage_24h < 0}]">
            {{ Number(tokenHistory.market_cap_change_percentage_24h).toFixed(2) }}%
          </div>
        </div>
      </div>
      <div class="chart-finance">
        <CandleStickChart />
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
import { formatCurrency } from '@coingecko/cryptoformat';
import { fetchJson } from '../../lib/utils';
import ButtonDefault from '../../components/ButtonDefault.vue';
import CandleStickChart from '../../components/charts/CandleStickChart.vue';
import PairTable from '../../components/overview/PairTable.vue';

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
      tokenHistory: {},
    };
  },
  async mounted() {
    const [
      token,
      markets,
    ] = await Promise.all([
      fetchJson(`http://localhost:3000/tokens/${this.$route.params.address}`),
      fetchJson('https://api.coingecko.com/api/v3/coins/markets?ids=aeternity&vs_currency=usd'),
    ]);

    if (markets.length) {
      // eslint-disable-next-line prefer-destructuring
      this.tokenHistory = markets[0];
    }
    this.token = token;
  },
  methods: {
    tokenPriceFormat(price) {
      return formatCurrency(price, 'USD', 'en');
    },
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
    .percentage {
      @extend %face-sans-14-regular;

      color: variables.$color-green;

      &.red {
        color: variables.$color-red;
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

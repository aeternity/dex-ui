<template>
  <ExploreWrapper>
    <div class="flex flex-row p-6 gap-6 items-center">
      <div class="flex-1">
        <h1 class="text-2xl">TVL</h1>
        <PriceHistoryGraph v-if="graphData" :x="graphData.x" :datasets="tvl" initial-chart="TVL" />
      </div>
      <div class="flex-1">
        <h1 class="text-2xl">Volume</h1>
        <PriceHistoryGraph
          v-if="graphData"
          :x="graphData.x"
          :datasets="volume"
          initial-chart="Volume"
        />
      </div>
    </div>
    <DividerLine />
    <div class="flex flex-row space-x-6 p-6 text-2xl text-left text-gray-500">
      <a
        :class="{
          'cursor-pointer': true,
          'text-white': activeTab === 'Tokens',
        }"
        @click="setActiveTab('Tokens')"
        @keydown="setActiveTab('Tokens')"
      >
        Tokens
      </a>
      <span
        :class="{
          'cursor-pointer': true,
          'text-white': activeTab === 'Pairs',
        }"
        @click="setActiveTab('Pairs')"
        @keydown="setActiveTab('Pairs')"
      >
        Pools
      </span>
      <span
        :class="{
          'cursor-pointer': true,
          'text-white': activeTab === 'Transactions',
        }"
        @click="setActiveTab('Transactions')"
        @keydown="setActiveTab('Transactions')"
      >
        Transactions
      </span>
    </div>

    <div v-if="activeTab === 'Pairs'">
      <PairTable :pairs="pairTable" :page-size="20" />
    </div>
    <div v-if="activeTab === 'Transactions'">
      <TransactionTable :transactions="transactionTable" :page-size="20" />
    </div>
    <DividerLine />

    <!-- TODO TABLE WITH TOKENS  -->
  </ExploreWrapper>
</template>
<script>
import { defineComponent } from 'vue';
import ExploreWrapper from '@/components/explore/ExploreWrapper.vue';
import { mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
import PriceHistoryGraph from '@/components/explore/PriceHistoryGraph.vue';
import PairTable from '@/components/explore/PairTable.vue';
import TransactionTable from '@/components/explore/TransactionTable.vue';
import DividerLine from '@/components/explore/DividerLine.vue';

export default defineComponent({
  components: { DividerLine, TransactionTable, PairTable, PriceHistoryGraph, ExploreWrapper },
  data() {
    return {
      pairs: [],
      history: [],
      tokenMap: new Map(),
      activeTab: 'Pairs',
    };
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    tvl() {
      return [this.graphData.datasets[0]];
    },
    volume() {
      return [this.graphData.datasets[1]];
    },
    pairTable() {
      return this.pairs
        .map((pair) => ({
          ...pair,
          token0: this.tokenMap.get(pair.token0),
          token1: this.tokenMap.get(pair.token1),
          transactions: String(pair.transactions),
        }))
        .sort((a, b) => b.volumeUsdMonth - a.volumeUsdMonth || b.volumeUsdAll - a.volumeUsdAll);
    },
    transactionTable() {
      return this.history
        .slice()
        .reverse()
        .map((tx) => ({
          ...tx,
          ...this.pairToToken(tx.pairAddress),
        }));
    },
    graphData() {
      let tvl = new BigNumber(0);
      return this.history.reduce(
        (acc, tx) => {
          // TVL
          // deltaUsdValue is already calculated but absolute, so we need to check the deltaReserve to get the sign
          const delta0 = new BigNumber(tx.delta0UsdValue).times(Math.sign(tx.deltaReserve0));
          const delta1 = new BigNumber(tx.delta1UsdValue).times(Math.sign(tx.deltaReserve1));
          tvl = tvl.plus(delta0.isNaN() ? 0 : delta0).plus(delta1.isNaN() ? 0 : delta1);
          acc.datasets[0].data = [...acc.datasets[0].data, tvl.toString()].map((d) => d || 0);

          // VOLUME
          if (tx.type === 'SwapTokens') {
            acc.datasets[1].data = [
              ...acc.datasets[1].data,
              new BigNumber(tx.delta0UsdValue).plus(tx.delta1UsdValue).toString(),
            ].map((d) => d || 0);
          } else {
            acc.datasets[1].data = [...acc.datasets[1].data, 0].map((d) => d || 0);
          }
          acc.x = [...acc.x, tx.microBlockTime];
          return acc;
        },
        {
          x: [],
          datasets: [
            {
              label: 'TVL',
              data: [],
            },
            {
              label: 'Volume',
              data: [],
            },
          ],
        },
      );
    },
  },
  async mounted() {
    // fetch all tokens
    const tokens = await this.$store.dispatch('backend/getAllTokens');
    this.tokenMap = new Map(tokens.map((token) => [token.address, token]));
    // fetch all pairs
    const fetchResult = await this.$store.dispatch('backend/fetchPairs');
    this.pairs = Object.values(fetchResult);

    // fetch all history
    this.history = await this.$store.dispatch('backend/fetchHistory');
  },
  methods: {
    pairToToken(pairAddress) {
      const pair = this.pairs.find((p) => p.address === pairAddress);
      return {
        token0: this.tokenMap.get(pair.token0),
        token1: this.tokenMap.get(pair.token1),
      };
    },
    setActiveTab(tab) {
      this.activeTab = tab;
    },
  },
});
</script>
<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';
@use '../styles/mixins.scss';

.explore-wrapper {
  display: flex;
  flex-direction: column;
  margin: 4vh auto 0;
  border-radius: 24px;
  max-width: 1280px;
  background: variables.$color-black3;
  box-shadow:
    rgb(0 0 0 / 1%) 0 0 1px,
    rgb(0 0 0 / 4%) 0 4px 8px,
    rgb(0 0 0 / 4%) 0 16px 24px,
    rgb(0 0 0 / 1%) 0 24px 32px;
}
</style>

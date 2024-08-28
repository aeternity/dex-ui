<template>
  <ExploreWrapper>
    <div class="flex flex-col md:flex-row p-6 gap-6 items-center">
      <div class="flex-1">
        <h1 class="text-2xl">TVL</h1>
        <PriceHistoryGraph
          :available-graph-types="[{ type: 'TVL', text: 'TVL' }]"
          :initial-chart="{ type: 'TVL', text: 'TVL' }"
        />
      </div>
      <div class="flex-1">
        <h1 class="text-2xl">Volume</h1>
        <PriceHistoryGraph
          :available-graph-types="[{ type: 'Volume', text: 'Volume' }]"
          :initial-chart="{ type: 'Volume', text: 'Volume' }"
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
    <div v-if="activeTab === 'Tokens'">
      <TokenTable v-if="activeTab === 'Tokens'" :tokens="tokenTable" :page-size="20" />
    </div>
    <DividerLine />

    <!-- TODO TABLE WITH TOKENS  -->
  </ExploreWrapper>
</template>
<script>
import { defineComponent } from 'vue';
import ExploreWrapper from '@/components/explore/ExploreWrapper.vue';
import { mapGetters } from 'vuex';
import PriceHistoryGraph from '@/components/explore/PriceHistoryGraph.vue';
import PairTable from '@/components/explore/PairTable.vue';
import TransactionTable from '@/components/explore/TransactionTable.vue';
import DividerLine from '@/components/explore/DividerLine.vue';
import { detectAndModifyWAE } from '@/lib/utils';
import TokenTable from '@/components/explore/TokenTable.vue';

export default defineComponent({
  components: {
    TokenTable,
    DividerLine,
    TransactionTable,
    PairTable,
    PriceHistoryGraph,
    ExploreWrapper,
  },
  data() {
    return {
      pairs: [],
      history: [],
      tokenMap: new Map(),
      activeTab: 'Tokens',
    };
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    pairTable() {
      return this.pairs.map((pair) => ({
        ...pair,
        token0: this.tokenMap.get(pair.token0),
        token1: this.tokenMap.get(pair.token1),
        transactions: String(pair.transactions),
      }));
    },
    transactionTable() {
      return this.history.map((tx) => ({
        ...tx,
        ...this.pairToToken(tx.pairAddress),
      }));
    },
    tokenTable() {
      return [...this.tokenMap.values()];
    },
  },
  async mounted() {
    // fetch all tokens
    const tokens = await this.$store.dispatch('backend/getAllTokens');
    this.tokenMap = new Map(tokens.map((token) => [token.address, detectAndModifyWAE(token)]));
    // fetch all pairs
    const fetchResult = await this.$store.dispatch('backend/fetchPairs');
    this.pairs = Object.values(fetchResult);
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

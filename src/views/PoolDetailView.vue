<template>
  <ExploreWrapper>
    <div class="flex flex-row p-6 items-center">
      <span v-if="pairId" class="logo"><AddressAvatar :address="pairId" /></span>
      <h1 class="text-2xl">{{ pair?.token0.symbol }} / {{ pair?.token1.symbol }}</h1>
    </div>
    <div class="flex">
      <div class="flex-1 flex-auto p-6">
        <PriceHistoryGraph :price-data="graphData" />
      </div>
      <div class="flex flex-col flex-auto">
        <div class="flex flex-row mx-2 gap-2">
          <ButtonDefault
            fill="light"
            @click="$router.push({ name: 'swap', params: { id: pairId } })"
          >
            {{ $t('swap') }}
          </ButtonDefault>
          <ButtonDefault
            fill="light"
            @click="$router.push({ name: 'pool', params: { id: pairId } })"
          >
            {{ $t('add-liquidity') }}
          </ButtonDefault>
        </div>
        <div>
          <StatElement title="TVL" :value="`$${tvl}`" />
          <StatElement title="Volume (24h)" :value="`$${volume}`" />
          <StatElement title="Fees (24h)" :value="`$${fees}`" />
        </div>
      </div>
    </div>
    <div class="border-2 border-gray-800"></div>
    <div>
      <h2 class="text-2xl text-left p-4 pb-0">Transactions</h2>
      <TransactionTable
        v-if="pair && augmentedReversedTransactions"
        :transactions="augmentedReversedTransactions"
        :token0="pair?.token0"
        :token1="pair?.token1"
      ></TransactionTable>
    </div>

    <div class="border-2 border-gray-800"></div>
    <div>
      <h2 class="text-2xl text-left p-4 pb-0">Pair Information</h2>
      <div class="flex flex-row gap-12 w-full text-left p-4">
        <div>
          <div>Pair Name</div>
          <div>{{ pair?.token0.symbol }} / {{ pair?.token1.symbol }}</div>
        </div>
        <div>
          <div>Pair Address</div>
          <div>
            <a
              v-if="activeNetwork"
              class="flex gap-2"
              :href="`${activeNetwork.explorerUrl}/contracts/${pairId}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ shortenAddress(pairId) }}
              <ExternalLinkIcon aria-hidden="true" />
              <span class="sr-only">External link</span>
            </a>
          </div>
        </div>
        <div>
          <div>{{ pair?.token0?.symbol }} Address</div>
          <div>
            <a
              v-if="activeNetwork"
              class="flex gap-2"
              :href="`${activeNetwork.explorerUrl}/contracts/${pair?.token0?.address}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ shortenAddress(pair?.token0?.address) }}
              <ExternalLinkIcon aria-hidden="true" />
              <span class="sr-only">External link</span>
            </a>
          </div>
        </div>
        <div>
          <div>{{ pair?.token1?.symbol }} Address</div>
          <div>
            <a
              v-if="activeNetwork"
              class="flex gap-2"
              :href="`${activeNetwork.explorerUrl}/contracts/${pair?.token1?.address}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ shortenAddress(pair?.token1?.address) }}
              <ExternalLinkIcon aria-hidden="true" />
              <span class="sr-only">External link</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </ExploreWrapper>
</template>
<script>
import { defineComponent } from 'vue';
import ExploreWrapper from '@/components/explore/ExploreWrapper.vue';
import AddressAvatar from '@/components/AddressAvatar.vue';
import PriceHistoryGraph from '@/components/explore/PriceHistoryGraph.vue';
import ButtonDefault from '@/components/ButtonDefault.vue';
import StatElement from '@/components/explore/StatElement.vue';
import { calculateUsdValue, formatAmountPretty, shortenAddress } from '@/lib/utils';
import { mapGetters } from 'vuex';
import ExternalLinkIcon from '@/assets/external-link.svg';
import TransactionTable from '@/components/explore/TransactionTable.vue';
import BigNumber from 'bignumber.js';

export default defineComponent({
  components: {
    TransactionTable,
    ExternalLinkIcon,
    StatElement,
    ButtonDefault,
    PriceHistoryGraph,
    AddressAvatar,
    ExploreWrapper,
  },
  data() {
    return {
      pairId: null,
      pair: null,
      history: [],
      graphData: [],
    };
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    augmentedReversedTransactions() {
      return this.history
        .slice()
        .reverse()
        .map((tx) => ({
          ...tx,
          usdValue: calculateUsdValue({
            ...tx,
            reserve0: tx.deltaReserve0,
            reserve1: tx.deltaReserve1,
            decimals0: this.pair.token0.decimals,
            decimals1: this.pair.token1.decimals,
          }),
        }));
    },
    tvl() {
      const tx = this.history[this.history.length - 1];
      if (!tx || !this.pair) return '0';
      return calculateUsdValue({
        ...tx,
        reserve0: tx.reserve0,
        reserve1: tx.reserve1,
        decimals0: this.pair.token0.decimals,
        decimals1: this.pair.token1.decimals,
      });
    },
    volume() {
      // aggregate volume over the last 24 hours
      const txs = this.augmentedReversedTransactions.filter(
        (tx) => Date.now() - tx.microBlockTime < 24 * 60 * 60 * 1000,
      );
      if (!txs.length) return '0';
      return formatAmountPretty(
        txs.reduce((acc, tx) => acc.plus(tx.usdValue || 0), new BigNumber(0)),
        0,
      );
    },
    fees() {
      return '0';
    },
  },
  async mounted() {
    // extract param from URL
    this.pairId = this.$route.params.id;

    // Fetch pair info
    this.pair = await this.$store.dispatch('backend/fetchPairDetails', {
      pairAddress: this.pairId,
    });

    // Fetch pair price history
    this.history = await this.$store.dispatch('backend/fetchHistory', {
      pairAddress: this.pairId,
    });
    this.graphData = this.history
      .map((h) => ({
        x: h.microBlockTime,
        y: h.reserve0 / h.reserve1,
      }))
      .filter((h) => h.y > 0);
  },
  methods: { shortenAddress },
});
</script>
<style lang="scss" scoped>
.logo {
  margin-right: 10px;
  img {
    width: 45px;
    height: 45px;
  }
}
.header {
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-bottom: 20px;
  h1 {
    font-size: 24px;
    font-weight: 500;
  }
}
.button-default {
  margin-top: 20px;
  padding: 16px;
  font-size: 20px;
  width: 100%;
}
svg {
  width: 18px;
  height: 18px;
  margin-top: 3px;
}
</style>

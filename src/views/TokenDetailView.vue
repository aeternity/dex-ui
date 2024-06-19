<template>
  <ExploreWrapper>
    <div class="flex flex-row px-6 pt-6 items-center">
      <span v-if="tokenId" class="logo"><AddressAvatar :address="tokenId" /></span>
      <h1 class="text-2xl">{{ metaInfo?.symbol }} / {{ metaInfo?.name }}</h1>
    </div>
    <div class="flex flex-col md:flex-row">
      <div class="flex-auto p-4 md:p-6">
        <PriceHistoryGraph :datasets="graphData.datasets" :x="graphData.x" :loading="loading" />
      </div>
      <div class="flex flex-col flex-auto p-4 md:p-0 md:mr-2">
        <div class="flex flex-row space-x-2 mb-4">
          <ButtonDefault
            fill="light"
            class="w-full"
            @click="$router.push({ name: 'swap', query: { from: 'AE', to: tokenId } })"
          >
            {{ $t('poolDetail.swap') }}
          </ButtonDefault>
          <ButtonDefault
            fill="light"
            class="whitespace-nowrap"
            @click="$router.push({ name: 'pool', params: { id: tokenId } })"
          >
            {{ $t('poolDetail.addLiquidity') }}
          </ButtonDefault>
        </div>
        <div class="flex flex-row justify-between md:flex-col">
          <div>
            <StatElement title="Price" :value="price" />
            <StatElement title="TVL" :value="tvl" />
            <StatElement title="Locked" :value="`${locked} ${metaInfo.symbol}`" />
          </div>
          <div>
            <StatElement title="Total Supply" :value="`${supply} ${metaInfo.symbol}`" />
            <StatElement title="FDV" :value="fdv" />
            <StatElement title="Volume (24h)" :value="volume" />
          </div>
        </div>
        <div>
          <!-- TODO add links here -->
        </div>
      </div>
    </div>
    <DividerLine />
    <div>
      <h2 class="text-2xl text-left p-4 pb-0">Transactions</h2>
      <TransactionTable
        v-if="metaInfo && reversedTransactions && pairMap.size > 0"
        :transactions="reversedTransactions"
      ></TransactionTable>
    </div>
    <div class="border-2 border-gray-800"></div>
    <div>
      <h2 class="text-2xl text-left p-4 pb-0">Pools</h2>
      <PairTable :pairs="pairTable"></PairTable>
    </div>

    <DividerLine />
    <div>
      <h2 class="text-2xl text-left p-4 pb-0">Token Information</h2>
      <div class="flex flex-row gap-12 w-full text-left p-4">
        <InfoElement title="Token Name" :value="metaInfo.name" />
        <InfoElement title="Token Symbol" :value="metaInfo.symbol" />
        <InfoElement
          title="Contract Address"
          :value="shortenAddress(tokenId)"
          :link="`${activeNetwork.explorerUrl}/contracts/${tokenId}`"
        />
      </div>
    </div>
  </ExploreWrapper>
</template>
<script>
import { defineComponent } from 'vue';
import ExploreWrapper from '@/components/explore/ExploreWrapper.vue';
import AddressAvatar from '@/components/AddressAvatar.vue';
import ButtonDefault from '@/components/ButtonDefault.vue';
import StatElement from '@/components/explore/StatElement.vue';
import PriceHistoryGraph from '@/components/explore/PriceHistoryGraph.vue';
import {
  detectAndModifyWAE,
  formatAmountPretty,
  formatUsdPretty,
  shortenAddress,
} from '@/lib/utils';
import BigNumber from 'bignumber.js';
import TransactionTable from '@/components/explore/TransactionTable.vue';
import { mapGetters } from 'vuex';
import InfoElement from '@/components/explore/InfoElement.vue';
import PairTable from '@/components/explore/PairTable.vue';
import DividerLine from '@/components/explore/DividerLine.vue';

export default defineComponent({
  components: {
    DividerLine,
    PairTable,
    InfoElement,
    TransactionTable,
    PriceHistoryGraph,
    StatElement,
    ButtonDefault,
    AddressAvatar,
    ExploreWrapper,
  },
  data() {
    return {
      tokenId: null,
      history: [],
      pairs: {
        pairs0: [],
        pairs1: [],
      },
      pairTable: [],
      pairMap: new Map(),
      tokenIdMap: new Map(),
      metaInfo: {
        decimals: 0,
        name: '',
        extensions: [],
        symbol: '',
        contract_id: '',
        contract_tx_hash: '',
        event_supply: 0,
        holders: 0,
        initial_supply: 0,
      },
      loading: false,
    };
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    graphData() {
      let reserve = new BigNumber(0);
      return this.history.reduce(
        (acc, tx) => {
          reserve = reserve.plus(this.getDeltaReserve(tx));
          acc.datasets[0].data = [...acc.datasets[0].data, this.getUsdPrice(tx)].map((d) => d || 0);
          acc.datasets[1].data = [
            ...acc.datasets[1].data,
            new BigNumber(reserve)
              .multipliedBy(this.getUsdPrice(tx))
              .div(new BigNumber(10).pow(this.metaInfo.decimals)),
          ].map((d) => d || 0);
          acc.datasets[2].data = [
            ...acc.datasets[2].data,
            new BigNumber(reserve).div(new BigNumber(10).pow(this.metaInfo.decimals)),
          ].map((d) => d || 0);
          if (tx.type === 'SwapTokens') {
            acc.datasets[3].data = [
              ...acc.datasets[3].data,
              new BigNumber(this.getDeltaReserve(tx))
                .abs()
                .multipliedBy(this.getUsdPrice(tx))
                .div(new BigNumber(10).pow(this.metaInfo.decimals)),
            ].map((d) => d || 0);
          } else {
            acc.datasets[3].data = [...acc.datasets[3].data, 0];
          }
          acc.x = [...acc.x, tx.microBlockTime];
          return acc;
        },
        {
          x: [],
          datasets: [
            {
              label: 'Price',
              data: [],
            },
            {
              label: 'TVL',
              data: [],
            },
            {
              label: 'Locked',
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
    reversedTransactions() {
      return this.history
        .slice()
        .reverse()
        .map((tx) => ({
          ...tx,
          token0: this.pairMap.get(tx.pairAddress).token0,
          token1: this.pairMap.get(tx.pairAddress).token1,
        }));
    },
    supply() {
      return formatAmountPretty(this.metaInfo.event_supply, this.metaInfo.decimals);
    },
    priceRaw() {
      // latest 20 history events
      const latestHistoryEntries = this.history.slice(-5);
      // average the price of the last events
      const historicPriceEntries = latestHistoryEntries
        .map((historyElement) => this.getUsdPrice(historyElement))
        .filter((price) => !price.isNaN());

      return historicPriceEntries
        .reduce((a, b) => a.plus(b), BigNumber(0))
        .div(historicPriceEntries.length);
    },
    price() {
      return formatUsdPretty(this.priceRaw, 0);
    },
    lockedRaw() {
      return this.pairs?.pairs0
        .map((pair) => pair.liquidityInfo.reserve0)
        .filter((reserve) => !!reserve)
        .reduce((a, b) => a.plus(b), BigNumber(0))
        .plus(
          this.pairs.pairs1
            .map((pair) => pair.liquidityInfo.reserve1)
            .filter((reserve) => !!reserve)
            .reduce((a, b) => a.plus(b), BigNumber(0)),
        )
        .div(new BigNumber(10).pow(this.metaInfo.decimals));
    },
    locked() {
      return formatAmountPretty(this.lockedRaw, 0);
    },
    tvl() {
      return formatUsdPretty(new BigNumber(this.lockedRaw).multipliedBy(this.priceRaw), 0);
    },
    fdv() {
      return formatUsdPretty(
        new BigNumber(this.metaInfo.event_supply).multipliedBy(this.priceRaw).toString(),
        this.metaInfo.decimals,
      );
    },
    volume() {
      return formatUsdPretty(
        this.history
          .filter((tx) => Date.now() - tx.microBlockTime < 24 * 60 * 60 * 1000)
          .filter((tx) => tx.type === 'SwapTokens')
          .reduce((acc, tx) => acc.plus(this.getUsdPrice(tx)), new BigNumber(0)),
        0,
      );
    },
    fees() {
      return 0;
    },
  },
  async mounted() {
    this.loading = true;
    // extract param from URL
    this.tokenId = this.$route.params.id;

    const metaInfo = await this.$store.dispatch('tokens/fetchToken', this.tokenId);
    this.metaInfo = detectAndModifyWAE({
      ...metaInfo,
      address: this.tokenId,
    });

    this.pairs = await this.$store.dispatch('backend/fetchPairsByToken', this.tokenId);

    if (!this.pairs) {
      this.loading = false;
      // redirect to 404
      this.$router.push({ name: 'not-found' });
      return;
    }

    this.pairMap = new Map([
      ...this.pairs.pairs0.map((pair) => [
        pair.address,
        {
          ...pair,
          token0: this.metaInfo,
          token1: detectAndModifyWAE(pair.oppositeToken),
        },
      ]),
      ...this.pairs.pairs1.map((pair) => [
        pair.address,
        {
          ...pair,
          token0: detectAndModifyWAE(pair.oppositeToken),
          token1: this.metaInfo,
        },
      ]),
    ]);

    const pairWithUSD = await this.$store.dispatch('backend/fetchPairsByTokenUsd', this.tokenId);
    this.pairTable = pairWithUSD.map((pair) => ({
      ...pair,
      token0: this.pairMap.get(pair.address).token0,
      token1: this.pairMap.get(pair.address).token1,
    }));
    this.tokenIdMap = new Map([
      ...this.pairs.pairs0.map((pair) => [pair.address, 0]),
      ...this.pairs.pairs1.map((pair) => [pair.address, 1]),
    ]);

    // Fetch token price history
    this.history = await this.$store.dispatch('backend/fetchHistory', {
      tokenAddress: this.tokenId,
    });
    this.loading = false;
  },
  methods: {
    shortenAddress,
    getDeltaReserve(historyEntry) {
      if (this.tokenIdMap.get(historyEntry.pairAddress) === 0) {
        return historyEntry.deltaReserve0;
      }
      return historyEntry.deltaReserve1;
    },
    getTokenPrice(historyEntry) {
      if (this.tokenIdMap.get(historyEntry.pairAddress) === 0) {
        return historyEntry.token0AePrice;
      }
      return historyEntry.token1AePrice;
    },
    getUsdPrice(historyEntry) {
      return new BigNumber(this.getTokenPrice(historyEntry)).multipliedBy(historyEntry.aeUsdPrice);
    },
  },
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
</style>

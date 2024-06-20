<template>
  <ExploreWrapper>
    <div class="flex flex-row px-6 pt-6 items-center">
      <span v-if="pairId" class="logo"><AddressAvatar :address="pairId" /></span>
      <h1 class="text-2xl">
        <router-link :to="`/explore/tokens/${pair?.token0.address}`">{{
          pair?.token0.symbol
        }}</router-link>
        /
        <router-link :to="`/explore/tokens/${pair?.token1.address}`">{{
          pair?.token1.symbol
        }}</router-link>
      </h1>
    </div>
    <div class="flex flex-col md:flex-row">
      <div class="flex-auto p-4 md:p-6">
        <PriceHistoryGraph :loading="loading" :datasets="graphData.datasets" :x="graphData.x" />
      </div>
      <div class="flex flex-col flex-auto p-4 md:p-0 md:mr-2">
        <div class="flex flex-row space-x-2 mb-4">
          <ButtonDefault
            fill="light"
            class="w-full"
            @click="
              $router.push({
                name: 'swap',
                query: {
                  from: pair?.token0.address,
                  to: pair?.token1.address,
                },
              })
            "
          >
            {{ $t('poolDetail.swap') }}
          </ButtonDefault>
          <ButtonDefault
            fill="light"
            class="whitespace-nowrap"
            @click="
              $router.push({
                name: 'add-pool',
                query: {
                  from: pair?.token0.address,
                  to: pair?.token1.address,
                },
              })
            "
          >
            {{ $t('poolDetail.addLiquidity') }}
          </ButtonDefault>
        </div>
        <div class="flex flex-row justify-between md:flex-col">
          <div>
            <StatElement title="TVL" :value="tvl" />
            <StatElement
              title="Pool Balances"
              :value="`${token0Amount} ${pair?.token0.symbol}`"
              :value2="`${token1Amount} ${pair?.token1.symbol}`"
            />
          </div>
          <div>
            <StatElement title="Volume (24h)" :value="volume" />
            <StatElement title="Fees (24h)" :value="fees" />
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
        v-if="pair && reversedTransactions"
        :transactions="reversedTransactions"
        :token0="pair?.token0"
        :token1="pair?.token1"
      ></TransactionTable>
    </div>

    <DividerLine />
    <div>
      <h2 class="text-2xl text-left p-4 pb-0">Pool Information</h2>
      <div class="flex flex-col md:flex-row gap-4 md:gap-12 w-full text-left p-4">
        <InfoElement title="Pool Name" :value="`${pair?.token0.symbol} / ${pair?.token1.symbol}`" />
        <InfoElement
          title="Pool Address"
          :value="shortenAddress(pairId)"
          :link="`${activeNetwork.explorerUrl}/contracts/${pairId}`"
        />
        <InfoElement
          :title="`${pair?.token0.symbol} Address`"
          :value="shortenAddress(pair?.token0?.address)"
          :link="`${activeNetwork.explorerUrl}/contracts/${pair?.token0?.address}`"
        />
        <InfoElement
          :title="`${pair?.token1.symbol} Address`"
          :value="shortenAddress(pair?.token1?.address)"
          :link="`${activeNetwork.explorerUrl}/contracts/${pair?.token1?.address}`"
        />
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
import {
  detectAndModifyWAE,
  formatAmountPretty,
  formatUsdPretty,
  shortenAddress,
} from '@/lib/utils';
import { mapGetters } from 'vuex';
import TransactionTable from '@/components/explore/TransactionTable.vue';
import BigNumber from 'bignumber.js';
import InfoElement from '@/components/explore/InfoElement.vue';
import DividerLine from '@/components/explore/DividerLine.vue';

export default defineComponent({
  components: {
    DividerLine,
    InfoElement,
    TransactionTable,
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
      loading: false,
    };
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    reversedTransactions() {
      return this.history
        .slice()
        .reverse()
        .map((tx) => ({
          ...tx,
          token0: this.pair.token0,
          token1: this.pair.token1,
        }));
    },
    last24hTransactions() {
      return this.reversedTransactions.filter(
        (tx) => Date.now() - tx.microBlockTime < 24 * 60 * 60 * 1000,
      );
    },
    tvl() {
      const tx = this.history[this.history.length - 1];
      if (!tx || !this.pair) return '0';
      return formatUsdPretty(new BigNumber(tx.reserve0Usd).plus(tx.reserve1Usd), 0);
    },
    volume() {
      if (!this.last24hTransactions.length) return '$0';
      return formatUsdPretty(
        this.last24hTransactions
          .filter((tx) => tx.type === 'SwapTokens')
          .reduce(
            (acc, tx) => acc.plus(tx.delta0UsdValue || 0).plus(tx.delta1UsdValue || 0),
            new BigNumber(0),
          ),
        0,
      );
    },
    fees() {
      if (!this.last24hTransactions.length) return '$0';
      return formatUsdPretty(
        this.last24hTransactions.reduce((acc, tx) => acc.plus(tx.txUsdFee || 0), new BigNumber(0)),
        0,
      );
    },
    token0Amount() {
      const tx = this.history[this.history.length - 1];
      return formatAmountPretty(tx?.reserve0, this.pair?.token0.decimals);
    },
    token1Amount() {
      const tx = this.history[this.history.length - 1];
      return formatAmountPretty(tx?.reserve1, this.pair?.token1.decimals);
    },
    graphData() {
      return this.history.reduce(
        (acc, tx) => {
          // Price 0/1
          acc.datasets[0].data = [
            ...acc.datasets[0].data,
            new BigNumber(tx.reserve0)
              .div(BigNumber(10).pow(this.pair.token0.decimals))
              .div(new BigNumber(tx.reserve1).div(BigNumber(10).pow(this.pair.token1.decimals)))
              .toString(),
          ].map((d) => d || 0);
          // Price 1/0
          acc.datasets[1].data = [
            ...(acc.datasets[1].data || []),
            new BigNumber(tx.reserve1)
              .div(BigNumber(10).pow(this.pair.token1.decimals))
              .div(new BigNumber(tx.reserve0).div(BigNumber(10).pow(this.pair.token0.decimals)))
              .toString(),
          ].map((d) => d || 0);
          // TVL
          acc.datasets[2].data = [
            ...acc.datasets[2].data,
            new BigNumber(tx.reserve0Usd).plus(tx.reserve1Usd).toString(),
          ].map((d) => d || 0);
          // Fee
          acc.datasets[3].data = [...acc.datasets[3].data, tx.txUsdFee].map((d) => d || 0);
          // Volume
          if (tx.type === 'SwapTokens') {
            acc.datasets[4].data = [
              ...acc.datasets[4].data,
              new BigNumber(tx.delta0UsdValue).plus(tx.delta1UsdValue).toString(),
            ].map((d) => d || 0);
          } else {
            acc.datasets[4].data = [...acc.datasets[4].data, 0].map((d) => d || 0);
          }
          acc.x = [...acc.x, tx.microBlockTime];
          return acc;
        },
        {
          x: [],
          datasets: [
            {
              label: `${this.pair?.token1.symbol} / ${this.pair?.token0.symbol} Price`,
              data: [],
            },
            {
              label: `${this.pair?.token0.symbol} / ${this.pair?.token1.symbol} Price`,
              data: [],
            },
            {
              label: 'TVL',
              data: [],
            },
            {
              label: 'Fees',
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
    this.loading = true;
    // extract param from URL
    this.pairId = this.$route.params.id;

    // Fetch pair info
    this.pair = await this.$store.dispatch('backend/fetchPairDetails', {
      pairAddress: this.pairId,
    });

    if (!this.pair) {
      this.loading = false;
      // redirect to 404
      this.$router.push({ name: 'not-found' });
      return;
    }
    this.pair = {
      ...this.pair,
      token0: detectAndModifyWAE(this.pair.token0),
      token1: detectAndModifyWAE(this.pair.token1),
    };

    // Fetch pair price history
    this.history = await this.$store.dispatch('backend/fetchHistory', {
      pairAddress: this.pairId,
    });

    this.loading = false;
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
</style>

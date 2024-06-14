<template>
  <ExploreWrapper>
    <div class="flex flex-row px-6 pt-6 items-center">
      <span v-if="pairId" class="logo"><AddressAvatar :address="pairId" /></span>
      <h1 class="text-2xl">{{ pair?.token0.symbol }} / {{ pair?.token1.symbol }}</h1>
    </div>
    <div class="flex">
      <div class="flex-1 flex-auto p-6">
        <PriceHistoryGraph :datasets="graphData.datasets" :x="graphData.x" />
      </div>
      <div class="flex flex-col flex-auto mr-4">
        <div class="flex flex-row space-x-2 mb-4">
          <ButtonDefault
            fill="light"
            class="w-full"
            @click="$router.push({ name: 'swap', query: { from: 'AE', to: pairId } })"
          >
            {{ $t('poolDetail.swap') }}
          </ButtonDefault>
          <ButtonDefault
            fill="light"
            class="whitespace-nowrap"
            @click="$router.push({ name: 'pool', params: { id: pairId } })"
          >
            {{ $t('poolDetail.addLiquidity') }}
          </ButtonDefault>
        </div>
        <div>
          <StatElement title="TVL" :value="tvl" />
          <StatElement
            title="Pool Balances"
            :value="`${token0Amount} ${pair?.token0.symbol}`"
            :value2="`${token1Amount} ${pair?.token1.symbol}`"
          />
          <StatElement title="Volume (24h)" :value="volume" />
          <StatElement title="Fees (24h)" :value="fees" />
        </div>
        <div>
          <!-- TODO add links here -->
        </div>
      </div>
    </div>
    <div class="border-2 border-gray-800"></div>
    <div>
      <h2 class="text-2xl text-left p-4 pb-0">Transactions</h2>
      <TransactionTable
        v-if="pair && reversedTransactions"
        :transactions="reversedTransactions"
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
import { formatAmountPretty, formatUsdPretty, shortenAddress } from '@/lib/utils';
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
    };
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    reversedTransactions() {
      return this.history.slice().reverse();
    },
    last24hTransactions() {
      return this.reversedTransactions.filter(
        (tx) => Date.now() - tx.microBlockTime < 24 * 60 * 60 * 1000,
      );
    },
    tvl() {
      const tx = this.history[this.history.length - 1];
      if (!tx || !this.pair) return '0';
      return formatUsdPretty(tx.reserveUsd, 0);
    },
    volume() {
      if (!this.last24hTransactions.length) return '$0';
      return formatUsdPretty(
        this.last24hTransactions.reduce(
          (acc, tx) => acc.plus(tx.txUsdValue || 0),
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
          acc.datasets[0].data = [
            ...acc.datasets[0].data,
            new BigNumber(tx.reserve0)
              .div(BigNumber(10).pow(this.pair.token0.decimals))
              .div(new BigNumber(tx.reserve1).div(BigNumber(10).pow(this.pair.token1.decimals)))
              .toString(),
          ].map((d) => d || 0);
          acc.datasets[1].data = [
            ...(acc.datasets[1].data || []),
            new BigNumber(tx.reserve1)
              .div(BigNumber(10).pow(this.pair.token1.decimals))
              .div(new BigNumber(tx.reserve0).div(BigNumber(10).pow(this.pair.token0.decimals)))
              .toString(),
          ].map((d) => d || 0);
          acc.datasets[2].data = [...acc.datasets[2].data, tx.reserveUsd].map((d) => d || 0);
          acc.datasets[3].data = [...acc.datasets[3].data, tx.txUsdFee].map((d) => d || 0);
          acc.datasets[4].data = [...acc.datasets[4].data, tx.txUsdValue].map((d) => d || 0);
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

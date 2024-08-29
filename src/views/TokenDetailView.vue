<template>
  <ExploreWrapper>
    <div class="flex flex-row px-6 pt-6 items-center">
      <span v-if="tokenId" class="logo"><AddressAvatar :address="tokenId" /></span>
      <h1 class="text-2xl">{{ tokenWithUsd?.symbol }} / {{ tokenWithUsd?.name }}</h1>
    </div>
    <div class="flex flex-col md:flex-row">
      <div class="flex-auto p-4 md:p-6">
        <PriceHistoryGraph
          v-if="tokenId"
          :available-graph-types="[
            { type: 'Price', text: 'Price' },
            { type: 'TVL', text: 'TVL' },
            { type: 'Locked', text: 'Locked' },
            { type: 'Volume', text: 'Volume' },
          ]"
          :initial-chart="{ type: 'Volume', text: 'Volume' }"
          :token-id="tokenId"
        />
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
            @click="
              $router.push({
                name: 'add-pool',
                query: {
                  from: 'AE',
                  to: tokenId,
                },
              })
            "
          >
            {{ $t('poolDetail.addLiquidity') }}
          </ButtonDefault>
        </div>
        <div class="flex flex-row justify-between md:flex-col">
          <div>
            <StatElement title="Price" :value="price" />
            <StatElement title="TVL" :value="tvl" />
            <StatElement title="Locked" :value="`${locked} ${tokenWithUsd.symbol}`" />
          </div>
          <div>
            <StatElement title="Total Supply" :value="`${supply} ${tokenWithUsd.symbol}`" />
            <StatElement title="FDV" :value="fdv" />
            <StatElement title="Volume (24h)" :value="volume24h" />
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
        v-if="tokenWithUsd && reversedTransactions && pairMap.size > 0"
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
        <InfoElement title="Token Name" :value="tokenWithUsd.name" />
        <InfoElement title="Token Symbol" :value="tokenWithUsd.symbol" />
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
      tokenWithUsd: {
        address: '',
        symbol: '',
        name: '',
        decimals: 0,
        malformed: false,
        noContract: false,
        listed: false,
        priceAe: '',
        priceUsd: '',
        tvlAe: '',
        tvlUsd: '',
        totalReserve: '',
        pairs: 0,
        volumeUsdDay: '',
        volumeUsdWeek: '',
        volumeUsdMonth: '',
        volumeUsdYear: '',
        volumeUsdAll: '',
        priceChangeDay: '',
        priceChangeWeek: '',
        priceChangeMonth: '',
        priceChangeYear: '',
      },
      pairTable: [],
      pairMap: new Map(),
      totalSupply: 0,
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
          token0: this.pairMap.get(tx.pairAddress).token0,
          token1: this.pairMap.get(tx.pairAddress).token1,
        }));
    },
    supply() {
      return formatAmountPretty(this.totalSupply, this.tokenWithUsd.decimals);
    },
    price() {
      return formatUsdPretty(this.tokenWithUsd.priceUsd, 0);
    },
    locked() {
      return formatAmountPretty(this.tokenWithUsd.totalReserve, 0);
    },
    tvl() {
      return formatUsdPretty(this.tokenWithUsd.tvlUsd, 0);
    },
    fdv() {
      return formatUsdPretty(
        new BigNumber(this.totalSupply).multipliedBy(this.tokenWithUsd.priceUsd).toString(),
        this.tokenWithUsd.decimals,
      );
    },
    volume24h() {
      return formatUsdPretty(this.tokenWithUsd.volumeUsdDay || 0, 0);
    },
  },
  async mounted() {
    this.loading = true;
    // extract param from URL
    this.tokenId = this.$route.params.id;

    this.totalSupply = await this.$store
      .dispatch('tokens/fetchToken', this.tokenId)
      .then((r) => r.event_supply);

    this.pairs = await this.$store.dispatch('backend/fetchPairsByToken', this.tokenId);

    this.tokenWithUsd = await this.$store.dispatch('backend/getTokenWithUsd', this.tokenId);

    this.tokenWithUsd = detectAndModifyWAE({
      ...this.tokenWithUsd,
      address: this.tokenId,
    });

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
          token0: this.tokenWithUsd,
          token1: detectAndModifyWAE(pair.oppositeToken),
        },
      ]),
      ...this.pairs.pairs1.map((pair) => [
        pair.address,
        {
          ...pair,
          token0: detectAndModifyWAE(pair.oppositeToken),
          token1: this.tokenWithUsd,
        },
      ]),
    ]);

    const pairWithUSD = await this.$store.dispatch('backend/fetchPairsByTokenUsd', this.tokenId);
    this.pairTable = pairWithUSD.map((pair) => ({
      ...pair,
      token0: this.pairMap.get(pair.address).token0,
      token1: this.pairMap.get(pair.address).token1,
    }));

    // Fetch token price history
    this.history = await this.$store.dispatch('backend/fetchHistory', {
      tokenAddress: this.tokenId,
    });
    this.loading = false;
  },
  methods: {
    shortenAddress,
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

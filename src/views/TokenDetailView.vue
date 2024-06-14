<template>
  <ExploreWrapper>
    <div class="flex flex-row px-6 pt-6 items-center">
      <span v-if="tokenId" class="logo"><AddressAvatar :address="tokenId" /></span>
      <h1 class="text-2xl">{{ metaInfo?.symbol }} / {{ metaInfo?.name }}</h1>
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
        <div>
          <StatElement title="TVL" :value="tvl" />
          <StatElement title="Total Supply" :value="`${supply} ${metaInfo.symbol}`" />
          <StatElement title="Volume (24h)" :value="volume" />
          <StatElement title="Fees (24h)" :value="fees" />
        </div>
        <div>
          <!-- TODO add links here -->
        </div>
      </div>
    </div>
    <!-- Graph that shows price over time -->
    <!-- Stats -->
    <!-- List of transactions -->
    <!-- List of pools -->
  </ExploreWrapper>
</template>
<script>
import { defineComponent } from 'vue';
import ExploreWrapper from '@/components/explore/ExploreWrapper.vue';
import AddressAvatar from '@/components/AddressAvatar.vue';
import ButtonDefault from '@/components/ButtonDefault.vue';
import StatElement from '@/components/explore/StatElement.vue';
import PriceHistoryGraph from '@/components/explore/PriceHistoryGraph.vue';
import { formatAmountPretty } from '@/lib/utils';
import BigNumber from 'bignumber.js';

export default defineComponent({
  components: { PriceHistoryGraph, StatElement, ButtonDefault, AddressAvatar, ExploreWrapper },
  data() {
    return {
      tokenId: null,
      history: [],
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
    };
  },
  computed: {
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
              label: `Price`,
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
    supply() {
      return formatAmountPretty(this.metaInfo.event_supply, this.metaInfo.decimals);
    },
    tvl() {
      return 0;
    },
    volume() {
      return 0;
    },
    fees() {
      return 0;
    },
  },
  async mounted() {
    // extract param from URL
    this.tokenId = this.$route.params.id;

    // Fetch token price history
    this.history = await this.$store.dispatch('backend/fetchHistoryByToken', {
      tokenAddress: this.tokenId,
    });

    this.metaInfo = await this.$store.dispatch('tokens/fetchToken', this.tokenId);

    // todo fetch mdw data about token (total supply, etc)
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
svg {
  width: 18px;
  height: 18px;
  margin-top: 3px;
}
</style>

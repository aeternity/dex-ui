<template>
  <div class="relative overflow-x-auto">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-400 uppercase">
        <tr>
          <th scope="col" class="px-6 py-3"></th>
          <th scope="col" class="px-6 py-3">USD</th>
          <th scope="col" class="px-6 py-3">{{ token0?.symbol }} Amount</th>
          <th scope="col" class="px-6 py-3">{{ token1?.symbol }} Amount</th>
          <th scope="col" class="px-6 py-3">Account</th>
          <th scope="col" class="px-6 py-3">Time</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="tx in transactionsPaginated"
          :key="tx.transactionHash"
          class="border-b border-b-gray-700"
        >
          <th
            scope="row"
            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
          >
            <a
              :href="`${activeNetwork.explorerUrl}/transactions/${tx.transactionHash}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ typeToText(tx) }}
            </a>
          </th>
          <td class="px-6 py-4">
            {{ formatUsdPretty(new BigNumber(tx.delta0UsdValue).plus(tx.delta1UsdValue), 0) }}
          </td>
          <td class="px-6 py-4">
            {{ formatAmountPretty(tx.deltaReserve0, tx.token0.decimals) }}
            {{ tx.token0.symbol }}
          </td>
          <td class="px-6 py-4">
            {{ formatAmountPretty(tx.deltaReserve1, tx.token1.decimals) }}
            {{ tx.token1.symbol }}
          </td>
          <td class="px-6 py-4">
            <a
              v-if="activeNetwork"
              class="flex gap-2"
              :href="`${activeNetwork.explorerUrl}/accounts/${tx.senderAccount}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ shortenAddress(tx.senderAccount) }}
              <ExternalLinkIcon aria-hidden="true" />
              <span class="sr-only">External link</span>
            </a>
          </td>
          <td class="px-6 py-4">
            {{
              formatDistance(new Date(Number(tx.microBlockTime)), new Date(), { addSuffix: true })
            }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="transactions.length > 0">
      <div class="flex justify-end gap-4 p-4">
        <ButtonDefault fill="transparent" :disabled="page === 0" @click="setFirstPage">
          First
        </ButtonDefault>
        <ButtonDefault fill="transparent" :disabled="page === 0" @click="prevPage">
          Previous
        </ButtonDefault>
        <div class="py-2 px-1">
          {{ page + 1 }}
        </div>
        <ButtonDefault fill="transparent" :disabled="lastPage" @click="nextPage">
          Next
        </ButtonDefault>
        <ButtonDefault fill="transparent" :disabled="lastPage" @click="setLastPage">
          Last
        </ButtonDefault>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDistance } from 'date-fns';
import { mapGetters } from 'vuex';
import ExternalLinkIcon from '@/assets/external-link.svg';
import { formatAmountPretty, formatUsdPretty, shortenAddress } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import ButtonDefault from '@/components/ButtonDefault.vue';

export default {
  name: 'TransactionTable',
  components: { ButtonDefault, ExternalLinkIcon },
  props: {
    transactions: {
      type: Array,
      required: true,
    },
    token0: {
      type: Object,
      required: false,
      default: () => ({
        symbol: '',
      }),
    },
    token1: {
      type: Object,
      required: false,
      default: () => ({
        symbol: '',
      }),
    },
  },
  data() {
    return {
      page: 0,
    };
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    transactionsPaginated() {
      return this.transactions.slice(this.page * 10, this.page * 10 + 10);
    },
    lastPage() {
      return this.page * 10 + 10 >= this.transactions.length;
    },
  },
  methods: {
    nextPage() {
      if (!this.lastPage) this.page += 1;
    },
    prevPage() {
      if (this.page > 0) this.page -= 1;
    },
    setFirstPage() {
      this.page = 0;
    },
    setLastPage() {
      this.page = Math.floor(this.transactions.length / 10);
    },
    BigNumber,
    formatUsdPretty,
    shortenAddress,
    formatDistance,
    formatAmountPretty,
    typeToText(tx) {
      switch (tx.type) {
        case 'CreatePair':
          return 'Create Pair';
        case 'PairMint':
          return 'Add Liquidity';
        case 'PairBurn':
          return 'Remove Liquidity';
        case 'SwapTokens':
          return `Swap ${tx.deltaReserve0 < 0 ? tx.token1.symbol : tx.token0.symbol} for ${tx.deltaReserve0 > 0 ? tx.token1.symbol : tx.token0.symbol}`;
        default:
          return tx.type;
      }
    },
  },
};
</script>
<style scoped lang="scss">
svg {
  width: 16px;
  height: 16px;
}

.button-default {
  padding: 8px 16px;
  font-size: 16px;
}
</style>

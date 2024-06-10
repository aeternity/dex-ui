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
          v-for="tx in reversedTransactions"
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
              {{ typeToText(tx.type, tx.deltaReserve0, tx.deltaReserve1) }}
            </a>
          </th>
          <td class="px-6 py-4">0</td>
          <td class="px-6 py-4">
            {{ formatAmount(tx.deltaReserve0, token0.decimals) }}
            {{ token0.symbol }}
          </td>
          <td class="px-6 py-4">
            {{ formatAmount(tx.deltaReserve1, token1.decimals) }}
            {{ token1.symbol }}
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
  </div>
</template>

<script>
import { formatDistance } from 'date-fns';
import { mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
import ExternalLinkIcon from '@/assets/external-link.svg';
import { shortenAddress } from '@/lib/utils';

export default {
  name: 'TransactionTable',
  components: { ExternalLinkIcon },
  props: {
    transactions: {
      type: Array,
      required: true,
    },
    token0: {
      type: Object,
      required: true,
    },
    token1: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    reversedTransactions() {
      return this.transactions.slice().reverse();
    },
  },
  methods: {
    shortenAddress,
    formatDistance,
    formatAmount(amount, decimals) {
      const formattedAmount = new BigNumber(amount).div(new BigNumber(10).pow(decimals)).abs();
      return formattedAmount
        .toFixed(Math.max(0, 5 - formattedAmount.toFixed(0).length))
        .replace(/\.?0+$/, ''); // remove trailing 0s
    },
    typeToText(eventType, delta0) {
      switch (eventType) {
        case 'CreatePair':
          return 'Create Pair';
        case 'PairMint':
          return 'Add Liquidity';
        case 'PairBurn':
          return 'Remove Liquidity';
        case 'SwapTokens':
          return `Swap ${delta0 < 0 ? this.token1.symbol : this.token0.symbol} for ${delta0 > 0 ? this.token1.symbol : this.token0.symbol}`;
        default:
          return eventType;
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
</style>

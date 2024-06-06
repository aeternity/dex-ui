<template>
  <div class="relative overflow-x-auto">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase">
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
            {{
              new BigNumber(tx.deltaReserve0)
                .div(new BigNumber(10).pow(token0.decimals))
                .abs()
                .toFixed(4)
            }}
            {{ token0.symbol }}
          </td>
          <td class="px-6 py-4">
            {{
              new BigNumber(tx.deltaReserve1)
                .div(new BigNumber(10).pow(token1.decimals))
                .abs()
                .toFixed(4)
            }}
            {{ token1.symbol }}
          </td>
          <td class="px-6 py-4">ak_tbd</td>
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

export default {
  name: 'TransactionTable',
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
  data() {
    return {
      txs: [
        {
          pairAddress: 'ct_2aj54uGyEebTj3zquptVunU1HALzbDDrbrN6LouQgujgJuAsEX',
          type: 'CreatePair',
          reserve0: '0',
          reserve1: '0',
          deltaReserve0: '0',
          deltaReserve1: '0',
          aeUsdPrice: '0.024174',
          height: 822999,
          microBlockHash: 'mh_2rxtGPoxFTR7VRcVru9JEL8QzV9qmQ2YJnrb3av64LqMe17aJZ',
          microBlockTime: '1692892137863',
          transactionHash: 'th_Qc4JX2M2dUWACdbqStvi1Dtp3QMvvrUyn113xQdj2xaXnupe6',
          transactionIndex: '0',
          logIndex: 0,
        },
      ],
    };
  },
  computed: {
    BigNumber() {
      return BigNumber;
    },
    ...mapGetters(['activeNetwork']),
    reversedTransactions() {
      return this.transactions.slice().reverse();
    },
  },
  methods: {
    formatDistance,
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
<style scoped lang="scss"></style>

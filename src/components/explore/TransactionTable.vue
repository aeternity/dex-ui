<template>
  <BaseTable :rows="transactionsTableData" :columns="columns" />
</template>

<script>
import { formatDistance } from 'date-fns';
import { mapGetters } from 'vuex';
import { formatAmountPretty, formatUsdPretty, shortenAddress } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import BaseTable from '@/components/explore/BaseTable.vue';

export default {
  name: 'TransactionTable',
  components: { BaseTable },
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
      columns: [
        { key: 'type', label: '' },
        { key: 'usd', label: 'USD' },
        { key: 'token0', label: `${this.token0.symbol} Amount` },
        { key: 'token1', label: `${this.token1.symbol} Amount` },
        { key: 'account', label: 'Account' },
        { key: 'time', label: 'Time' },
      ],
    };
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    transactionsTableData() {
      return this.transactions.map((tx) => ({
        type: {
          text: this.typeToText(tx),
          link: `${this.activeNetwork.explorerUrl}/transactions/${tx.transactionHash}`,
        },
        usd: {
          text: this.formatUsdPretty(new BigNumber(tx.delta0UsdValue).plus(tx.delta1UsdValue), 0),
        },
        token0: {
          text: `${this.formatAmountPretty(tx.deltaReserve0, tx.token0.decimals)} ${
            tx.token0.symbol
          }`,
        },
        token1: {
          text: `${this.formatAmountPretty(tx.deltaReserve1, tx.token1.decimals)} ${
            tx.token1.symbol
          }`,
        },
        account: {
          link: `${this.activeNetwork.explorerUrl}/accounts/${tx.senderAccount}`,
          text: this.shortenAddress(tx.senderAccount),
        },
        time: {
          text: this.formatDistance(new Date(Number(tx.microBlockTime)), new Date(), {
            addSuffix: true,
          }),
        },
      }));
    },
  },
  methods: {
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
<style scoped lang="scss"></style>

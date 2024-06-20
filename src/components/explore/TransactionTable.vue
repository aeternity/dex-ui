<template>
  <BaseTable
    :rows="transactionsTableData"
    :columns="columns"
    :page-size="pageSize"
    initial-sort-by="time"
  />
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
    pageSize: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      columns: [
        { key: 'type', label: '' },
        { key: 'usd', label: 'USD', align: 'right', sortable: true },
        { key: 'token0', label: `${this.token0.symbol} Amount`, align: 'right', sortable: true },
        { key: 'token1', label: `${this.token1.symbol} Amount`, align: 'right', sortable: true },
        { key: 'account', label: 'Account', align: 'right' },
        { key: 'time', label: 'Time', align: 'right', sortable: true },
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
          value: tx.type,
        },
        usd: {
          text: this.formatUsdPretty(new BigNumber(tx.delta0UsdValue).plus(tx.delta1UsdValue), 0),
          value: new BigNumber(tx.delta0UsdValue).plus(tx.delta1UsdValue),
        },
        token0: {
          text: `${this.formatAmountPretty(tx.deltaReserve0, tx.token0.decimals)} ${
            tx.token0.symbol
          }`,
          value: new BigNumber(tx.deltaReserve0).div(10 ** tx.token0.decimals),
        },
        token1: {
          text: `${this.formatAmountPretty(tx.deltaReserve1, tx.token1.decimals)} ${
            tx.token1.symbol
          }`,
          value: new BigNumber(tx.deltaReserve1).div(10 ** tx.token1.decimals),
        },
        account: {
          link: `${this.activeNetwork.explorerUrl}/accounts/${tx.senderAccount}`,
          text: this.shortenAddress(tx.senderAccount),
          value: tx.senderAccount,
        },
        time: {
          text: this.formatDistance(new Date(Number(tx.microBlockTime)), new Date(), {
            addSuffix: true,
          }),
          value: tx.microBlockTime,
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

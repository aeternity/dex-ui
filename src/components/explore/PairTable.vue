<template>
  <BaseTable :columns="columns" :rows="pairsTableData" :page-size="pageSize" />
</template>

<script>
import BaseTable from '@/components/explore/BaseTable.vue';
import { formatUsdPretty } from '@/lib/utils';

export default {
  name: 'PairTable',
  components: { BaseTable },
  props: {
    pairs: {
      type: Array,
      required: true,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      columns: [
        { key: 'pair', label: '' },
        {
          key: 'txs',
          label: 'Transactions',
        },
        { key: 'tvl', label: 'TVL' },
        { key: 'volumeDay', label: 'Volume (24h)' },
        { key: 'volumeMonth', label: 'Volume (30d)' },
        { key: 'volumeAll', label: 'Volume' },
      ],
    };
  },
  computed: {
    pairsTableData() {
      return this.pairs.map((pair) => ({
        pair: {
          text: `${pair.token0.symbol}/${pair.token1.symbol}`,
          link: `/explore/pools/${pair.address}`,
        },
        txs: {
          text: pair.transactions,
        },
        tvl: {
          text: formatUsdPretty(pair.tvlUsd, 0),
        },
        volumeDay: {
          text: formatUsdPretty(pair.volumeUsdDay, 0),
        },
        volumeMonth: {
          text: formatUsdPretty(pair.volumeUsdMonth, 0),
        },
        volumeAll: {
          text: formatUsdPretty(pair.volumeUsdAll, 0),
        },
      }));
    },
  },
};
</script>
<style scoped lang="scss"></style>

<template>
  <BaseTable
    :columns="columns"
    :rows="pairsTableData"
    :page-size="pageSize"
    initial-sort-by="volumeAll"
  />
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
          align: 'right',
          sortable: true,
        },
        { key: 'tvl', label: 'TVL', align: 'right', sortable: true },
        { key: 'volumeDay', label: 'Volume (24h)', align: 'right', sortable: true },
        { key: 'volumeMonth', label: 'Volume (30d)', align: 'right', sortable: true },
        { key: 'volumeAll', label: 'Volume', align: 'right', sortable: true },
      ],
    };
  },
  computed: {
    pairsTableData() {
      return this.pairs.map((pair) => ({
        pair: {
          text: `${pair.token0.symbol} / ${pair.token1.symbol}`,
          link: `/explore/pools/${pair.address}`,
          value: `${pair.token0.symbol} / ${pair.token1.symbol}`,
        },
        txs: {
          text: String(pair.transactions),
          value: pair.transactions,
        },
        tvl: {
          text: formatUsdPretty(pair.tvlUsd, 0),
          value: pair.tvlUsd,
        },
        volumeDay: {
          text: formatUsdPretty(pair.volumeUsdDay || 0, 0),
          value: pair.volumeUsdDay,
        },
        volumeMonth: {
          text: formatUsdPretty(pair.volumeUsdMonth || 0, 0),
          value: pair.volumeUsdMonth,
        },
        volumeAll: {
          text: formatUsdPretty(pair.volumeUsdAll || 0, 0),
          value: pair.volumeUsdAll,
        },
      }));
    },
  },
};
</script>

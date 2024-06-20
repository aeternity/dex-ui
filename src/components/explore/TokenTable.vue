<template>
  <BaseTable
    :columns="columns"
    :rows="tokensTableData"
    :page-size="pageSize"
    initial-sort-by="volumeAll"
  />
</template>

<script>
import BaseTable from '@/components/explore/BaseTable.vue';
import { formatUsdPretty } from '@/lib/utils';
import BigNumber from 'bignumber.js';

export default {
  name: 'TokenTable',
  components: { BaseTable },
  props: {
    tokens: {
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
        { key: 'name', label: '' },
        {
          key: 'pairs',
          label: 'Pools',
          align: 'right',
          sortable: true,
        },
        { key: 'price', label: 'Price', align: 'right', sortable: true },
        { key: 'tvl', label: 'TVL', align: 'right', sortable: true },
        { key: 'priceChangeDay', label: 'Price Change (24h)', align: 'right', sortable: true },
        { key: 'priceChangeMonth', label: 'Price Change (30D)', align: 'right', sortable: true },
        { key: 'volumeDay', label: 'Volume (24h)', align: 'right', sortable: true },
        { key: 'volumeMonth', label: 'Volume (30d)', align: 'right', sortable: true },
        { key: 'volumeAll', label: 'Volume', align: 'right', sortable: true },
      ],
    };
  },
  computed: {
    tokensTableData() {
      return this.tokens.map((token) => ({
        name: {
          text: `${token.symbol} / ${token.name}`,
          link: `/explore/tokens/${token.address}`,
          value: `${token.symbol} / ${token.name}`,
        },
        pairs: {
          text: String(token.pairs),
          value: token.pairs,
        },
        tvl: {
          text: formatUsdPretty(token.tvlUsd, 0),
          value: token.tvlUsd,
        },
        price: {
          text: formatUsdPretty(token.priceUsd, 0),
          value: token.priceUsd,
        },
        priceChangeDay: {
          text: `${new BigNumber(token.priceChangeDay).toFixed(2)}%`,
          value: token.priceChangeDay,
        },
        priceChangeMonth: {
          text: `${new BigNumber(token.priceChangeMonth).toFixed(2)}%`,
          value: token.priceChangeMonth,
        },
        volumeDay: {
          text: formatUsdPretty(token.volumeUsdDay, 0),
          value: token.volumeUsdDay,
        },
        volumeMonth: {
          text: formatUsdPretty(token.volumeUsdMonth, 0),
          value: token.volumeUsdMonth,
        },
        volumeAll: {
          text: formatUsdPretty(token.volumeUsdAll, 0),
          value: token.volumeUsdAll,
        },
      }));
    },
  },
};
</script>
<style scoped lang="scss"></style>

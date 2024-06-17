<template>
  <BaseTable :columns="columns" :data="pairsTableData" />
</template>

<script>
import BaseTable from '@/components/explore/BaseTable.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'PairTable',
  components: { BaseTable },
  props: {
    pairs: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      columns: [{ key: 'pair', label: 'Pair' }],
    };
  },
  computed: {
    ...mapGetters(['activeNetwork']),
    pairsTableData() {
      return this.pairs.map((pair) => ({
        pair: {
          text: `${pair.token0.symbol}/${pair.token1.symbol}`,
          link: `${this.activeNetwork.explorerUrl}/contracts/${pair.id}`,
        },
      }));
    },
  },
};
</script>
<style scoped lang="scss"></style>

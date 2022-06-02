<template>
  <div class="pool-analytics">
    <div class="block">
      <div class="heading">
        <div>
          All Pools
        </div>
      </div>
      <PairTable />
    </div>
  </div>
</template>

<script>
import PairTable from '../../components/analytics/PairTable.vue';

export default {
  name: 'PoolOverview',
  components: {
    PairTable,
  },
};
</script>

<style lang="scss" scoped>
  @use '../../styles/analytics.scss';

</style>

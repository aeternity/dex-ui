<template>
  <div class="pool-overview">
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
import PairTable from '../../components/overview/PairTable.vue';

export default {
  name: 'PoolOverview',
  components: {
    PairTable,
  },
};
</script>

<style lang="scss" scoped>
  @use '../../styles/overview.scss';

</style>

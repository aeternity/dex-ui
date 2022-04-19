<template>
  <div class="pool-overview">
    <div class="block">
      <div class="heading">
        <div>
          All Pools
        </div>
      </div>
      <TokenTable />
    </div>
  </div>
</template>

<script>
import TokenTable from '../../components/overview/TokenTable.vue';

export default {
  name: 'PoolOverview',
  components: {
    TokenTable,
  },
};
</script>

<style lang="scss" scoped>
  @use '../../styles/overview.scss';

</style>

<template>
  <div class="token-analytics">
    <div class="block">
      <div class="heading">
        <div>
          All Tokens
        </div>
      </div>
      <TokenTable />
    </div>
  </div>
</template>

<script>
import TokenTable from '../../components/analytics/TokenTable.vue';

export default {
  name: 'TokenOverview',
  components: {
    TokenTable,
  },
};
</script>

<style lang="scss" scoped>
  @use '../../styles/analytics.scss';

</style>

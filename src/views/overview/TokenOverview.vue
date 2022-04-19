<template>
  <div class="token-overview">
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
import TokenTable from '../../components/overview/TokenTable.vue';

export default {
  name: 'TokenOverview',
  components: {
    TokenTable,
  },
};
</script>

<style lang="scss" scoped>
  @use '../../styles/overview.scss';

</style>

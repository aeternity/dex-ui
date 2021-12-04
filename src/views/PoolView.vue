<template>
  <MainWrapper
    title="Pool"
    back-button
    class="pool-view"
  >
    <ButtonDefault :to="{ name: 'add-pool' }">
      Add liquidity
    </ButtonDefault>
    <div class="title">
      <span>Your liquidity</span>
      <ButtonTooltip
        :tooltip="`Liquidity providers earn a 0.3% fee on
        all trades proportional to their share of the pool.
        Fees are added to the pool, accrue in real time
        and can be claimed by withdrawing your liquidity.`"
      >
        <img src="../assets/question-circle.svg">
      </ButtonTooltip>
    </div>
    <LiquidityItem
      v-for="info in poolsInfo"
      :key="info.id"
      :pool-info="info"
    />
    <span class="import">
      Don't see a pool you've joined?
      <RouterLink :to="{ name: 'import-pool' }">Import it.</RouterLink>
    </span>
  </MainWrapper>
</template>

<script>
import MainWrapper from '../components/MainWrapper.vue';
import ButtonDefault from '../components/ButtonDefault.vue';
import ButtonTooltip from '../components/ButtonTooltip.vue';
import LiquidityItem from '../components/LiquidityItem.vue';

export default {
  components: {
    MainWrapper,
    ButtonDefault,
    ButtonTooltip,
    LiquidityItem,
  },
  data: () => ({
    poolsInfo: [{ id: 1 }], // contract should provide such info
  }),
};
</script>

<style lang="scss" scoped>
.pool-view {
  .button-default {
    display: block;
    width: 100%;
    padding: 16px;
    margin-top: 8px;
    font-size: 16px;
    font-weight: 500;
  }

  .title {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;
    color: white;

    .button-tooltip img {
      height: 20px;
      width: 20px;
    }
  }

  .import {
    color: white;

    a {
      text-decoration: none;
      color: #2172e5;

      &:hover {
        color: #35b6ff;
      }
    }
  }
}
</style>

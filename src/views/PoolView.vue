<template>
  <MainWrapper
    :title="$t('pool.title')"
    class="pool-view"
  >
    <ButtonDefault :to="{ name: 'add-pool', query: $store.state.navigation.pool }">
      {{ $t('addLiquidity.title') }}
    </ButtonDefault>
    <div class="title">
      <span>{{ $t('pool.yourLiquidity') }}</span>
      <ButtonTooltip
        :tooltip="$t('pool.liquidityPopup')"
      >
        <QuestionCircle />
      </ButtonTooltip>
    </div>
    <div v-if="address">
      <LiquidityItem
        v-for="info in liquidity"
        :key="info.id"
        :pool-id="info.id"
        :pool-info="info.payload"
      />
    </div>
    <span class="import">
      {{ $t('pool.dontSeePool') }}
      <RouterLink :to="{ name: 'import-pool' }">{{ $t('pool.importIt') }}.</RouterLink>
    </span>
  </MainWrapper>
</template>

<script>
import { mapState } from 'vuex';
import MainWrapper from '../components/MainWrapper.vue';
import ButtonDefault from '../components/ButtonDefault.vue';
import ButtonTooltip from '../components/ButtonTooltip.vue';
import LiquidityItem from '../components/LiquidityItem.vue';
import QuestionCircle from '../assets/question-circle.svg?vue-component';

export default {
  components: {
    MainWrapper,
    ButtonDefault,
    ButtonTooltip,
    LiquidityItem,
    QuestionCircle,
  },
  computed: {
    ...mapState({
      address: 'address',
      liquidity: (state) => Object.keys(
        state.aeternity.providedLiquidity[state.address] || {},
      ).map((key) => ({
        id: key,
        payload: state.aeternity.providedLiquidity[state.address][key],
      })).filter((x) => x.payload),
    }),
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/typography.scss';

.pool-view {
  .button-default {
    display: block;
    width: 100%;
    padding: 16px;
    margin-top: 8px;

    @extend %face-sans-16-medium;
  }

  .title {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;
    color: white;

    .button-tooltip svg {
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

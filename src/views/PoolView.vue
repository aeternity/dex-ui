<template>
  <MainWrapper
    :title="$t('nav.pool')"
    class="pool-view"
  >
    <Head>
      <title>Pool - Superhero DEX</title>
    </Head>
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
      <RouterLink :to="{ name: 'import-pool' }">{{ $t('pool.importIt') }}</RouterLink>
    </span>

    <ButtonDefault @click="clickHandler">
      {{ address ? $t('addLiquidity.title') : $t('connectWallet') }}
    </ButtonDefault>
  </MainWrapper>
</template>

<script>
import { mapState } from 'vuex';
import { Head } from '@vueuse/head';
import QuestionCircle from '@/assets/question-circle.svg';
import MainWrapper from '@/components/MainWrapper.vue';
import ButtonDefault from '@/components/ButtonDefault.vue';
import ButtonTooltip from '@/components/ButtonTooltip.vue';
import LiquidityItem from '@/components/LiquidityItem.vue';

export default {
  components: {
    MainWrapper,
    ButtonDefault,
    ButtonTooltip,
    LiquidityItem,
    QuestionCircle,
    Head,
  },
  computed: {
    ...mapState({
      address: 'address',
      liquidity: (state) => Object.keys(
        state.aeternity.providedLiquidity[state.address] || {},
      ).map((key) => ({
        id: key,
        payload: state.aeternity.providedLiquidity[state.address][key],
      })).filter((x) => x.payload?.networkId === state.networkId),
    }),
  },
  methods: {
    async clickHandler() {
      if (this.address) {
        this.$router.push({
          name: 'add-pool',
          query: this.$store.state.navigation.pool,
        });
      } else {
        this.$store.dispatch('modals/open', { name: 'connect-wallet' });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.pool-view {
  .button-default {
    display: block;
    width: 100%;
    padding: 16px;
    margin-top: 22px;

    @extend %face-sans-16-medium;
  }

  .title {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;
    color: variables.$color-white;

    @extend %face-sans-15-medium;

    .button-tooltip svg {
      height: 20px;
      width: 20px;
    }
  }

  .import {
    color: variables.$color-gray2;

    @extend %face-sans-15-medium;

    a {
      text-decoration: none;
      color: variables.$color-primary;

      &:hover {
        color: variables.$color-primary-light;
      }
    }
  }
}
</style>

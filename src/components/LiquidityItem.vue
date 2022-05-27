<template>
  <div :class="['liquidity-item', { hidden: !show }]">
    <ButtonPlain
      class="header"
      @click="onShow"
    >
      <div>
        <img
          :class="{rotating: poolInfoImporting && !poolInfoImportFailed}"
          :src="`https://avatars.z52da5wt.xyz/${token0.cid}`"
        >
        <img
          :class="{rotating: poolInfoImporting && !poolInfoImportFailed}"
          :src="`https://avatars.z52da5wt.xyz/${token1.cid}`"
        >
        <span>{{ token0.symbol + '/' + token1.symbol }}</span>
      </div>
      <DownChevron :class="{ rotated: show }" />
    </ButtonPlain>
    <LiquidityDetails
      :pool-id="poolId"
      :pool-info="poolInfo"
      :pool-info-importing="poolInfoImporting"
      :pool-info-import-failed="poolInfoImportFailed"
      @load:pool-info="getPoolInfo"
    />
  </div>
</template>

<script>
import ButtonPlain from './ButtonPlain.vue';
import LiquidityDetails from './LiquidityDetails.vue';
import DownChevron from '../assets/arrow.svg?vue-component';
import { handleUnknownError } from '@/lib/utils';

export default {
  components: {
    ButtonPlain,
    LiquidityDetails,
    DownChevron,
  },
  props: {
    poolId: { type: String, required: true },
    poolInfo: { type: Object, required: true },
  },
  data: () => ({
    show: false,
    poolInfoImporting: false,
    poolInfoImportFailed: false,
  }),
  computed: {
    token0() {
      return this.poolInfo.token0;
    },
    token1() {
      return this.poolInfo.token1;
    },
  },
  methods: {
    async onShow() {
      this.show = !this.show;
      if (this.show) {
        this.getPoolInfo();
      }
    },
    async getPoolInfo() {
      try {
        this.poolInfoImporting = true;
        await this.$store.dispatch('aeternity/fetchPoolInfo', {
          tokenA: this.token0.cid,
          tokenB: this.token1.cid,
        });
        this.poolInfoImportFailed = false;
      } catch (error) {
        handleUnknownError(error);
        this.poolInfoImportFailed = true;
      } finally {
        this.poolInfoImporting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';
@use '../styles/animations.scss';

.liquidity-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 20px;
  border: 1px solid variables.$color-black;
  background-color: variables.$color-black2;
  margin-bottom: 20px;
  overflow: hidden;
  max-height: 700px;
  transition: max-height 0.2s ease-out;

  &.hidden {
    max-height: 49px;
  }

  svg,
  img {
    height: 24px;
    width: 24px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .rotated {
      transform: rotate(180deg);
    }

    > div {
      display: flex;
      align-items: center;

      img:nth-of-type(1) {
        z-index: 1;
      }

      img:nth-of-type(2) {
        margin-left: -10px;
      }

      span {
        color: white;
        margin-left: 15px;

        @extend %face-sans-18-medium;
      }
    }
  }
}
</style>

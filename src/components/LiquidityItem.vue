<template>
  <div :class="['liquidity-item', { hidden: !show }]">
    <ButtonPlain class="header" @click="onShow">
      <div>
        <TokenIcon
          :token-a="token0"
          :token-b="token1"
          :rotating="poolInfoImporting && !poolInfoImportFailed"
        />
        <span>{{ `${token0.symbol}/${token1.symbol}` }}</span>
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
import { mapGetters } from 'vuex';
import { handleUnknownError } from '@/lib/utils';
import DownChevron from '@/assets/arrow.svg';
import ButtonPlain from './ButtonPlain.vue';
import TokenIcon from './TokenIcon.vue';
import LiquidityDetails from './LiquidityDetails.vue';

export default {
  components: {
    ButtonPlain,
    TokenIcon,
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
    ...mapGetters('tokens', ['getAvailableTokens']),
    token0() {
      return {
        ...this.getAvailableTokens().find(
          (t) => t.contract_id === this.poolInfo.token0.contract_id,
        ),
        ...this.poolInfo.token0,
      };
    },
    token1() {
      return {
        ...this.getAvailableTokens().find(
          (t) => t.contract_id === this.poolInfo.token1.contract_id,
        ),
        ...this.poolInfo.token1,
      };
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
          tokenA: this.token0.contract_id,
          tokenB: this.token1.contract_id,
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

  svg {
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

      span {
        color: white;
        margin-left: 15px;

        @extend %face-sans-18-medium;
      }
    }
  }
}
</style>

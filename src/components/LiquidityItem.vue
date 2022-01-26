<template>
  <div :class="['liquidity-item', { hidden: !show }]">
    <ButtonPlain
      class="header"
      @click="onShow"
    >
      <div>
        <img src="../assets/logo.png">
        <img src="../assets/ae.svg">
        <span>{{ token0.symbol+'/'+token1.symbol }}</span>
      </div>
      <img
        src="../assets/arrow.svg"
        :class="{ rotated: show }"
      >
    </ButtonPlain>
    <div class="body">
      <div>
        <span>Pooled {{ token0.symbol }}:</span>
        <div>
          {{ amount0Text }}
          <img src="../assets/ae.svg">
        </div>
      </div>
      <div>
        <span>Pooled {{ token1.symbol }}:</span>
        <div>
          {{ amount1Text }}
          <img src="../assets/logo.png">
        </div>
      </div>
      <div>
        <span>Your pool tokens:</span>
        <span>{{ balanceText }}</span>
      </div>
      <div>
        <span>Your pool share:</span>
        <span>{{ shareText }}%</span>
      </div>
    </div>
    <div class="buttons">
      <a
        href="https://aeternity.com/"
        target="_blank"
      >
        View pool information
      </a>
      <div>
        <ButtonDefault
          fill="transparent-blue"
          :to="{ name: 'add-pool' }"
        >
          Add
        </ButtonDefault>
        <ButtonDefault
          fill="transparent-blue"
          :to="{ name: 'remove-pool' }"
        >
          Remove
        </ButtonDefault>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import ButtonPlain from './ButtonPlain.vue';
import ButtonDefault from './ButtonDefault.vue';
import { reduceDecimals } from '../lib/utils';

export default {
  components: {
    ButtonPlain,
    ButtonDefault,
  },
  props: {
    poolId: { type: String, required: true },
    poolInfo: { type: Object, required: true },
  },
  data: () => ({
    show: false,
  }),
  computed: {
    ...mapState({
      supplyInfoObject: (state) => state.aeternity.poolInfo,
    }),
    supplyInfo() {
      return this.supplyInfoObject[this.poolId];
    },
    token0() {
      return this.poolInfo.token0;
    },
    token1() {
      return this.poolInfo.token1;
    },
    reserve0() {
      return this.supplyInfo?.token0.reserve;
    },
    reserve1() {
      return this.supplyInfo?.token1.reserve;
    },
    totalSupply() {
      return this.supplyInfo?.totalSupply;
    },
    balance() {
      return this.poolInfo.balanceStr && BigInt(this.poolInfo.balanceStr);
    },
    balanceText() {
      return reduceDecimals(this.balance, 18);
    },
    amount0() {
      return this.calculateAmount(this.balance, this.totalSupply, this.reserve0);
    },
    amount0Text() {
      return this.amount0 === null ? '-' : reduceDecimals(this.amount0, this.token0.decimals);
    },
    amount1() {
      return this.calculateAmount(this.balance, this.totalSupply, this.reserve1);
    },
    amount1Text() {
      return this.amount1 === null ? '-' : reduceDecimals(this.amount1, this.token1.decimals);
    },
    shareText() {
      return this.balance === null || !this.totalSupply
        ? '-'
        : BigNumber(this.balance).times(100).div(this.totalSupply).toFixed(6);
    },

  },
  methods: {
    calculateAmount(balance, totalSupply, reserve) {
      if (!balance || !totalSupply || !reserve) {
        return null;
      }
      const share = BigNumber(balance).times(100).div(totalSupply);
      const amount = BigNumber(reserve).times(share).div(100);
      return BigInt(amount.toFixed(0));
    },
    async onShow() {
      this.show = !this.show;
      if (this.show) {
        await this.$store.dispatch('aeternity/getPoolInfo', {
          tokenA: this.token0.cid,
          tokenB: this.token1.cid,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.liquidity-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 20px;
  border: 1px solid variables.$color-black;
  margin-bottom: 20px;
  overflow: hidden;
  max-height: 700px;
  transition: max-height 0.2s ease-out;

  &.hidden {
    max-height: 49px;
  }

  img {
    height: 20px;
    width: 20px;
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

  .body {
    margin-top: 8px;

    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: white;
      margin-top: 8px;

      div {
        display: flex;
        align-items: center;

        img {
          margin-left: 4px;
        }
      }
    }
  }

  .buttons {
    margin-top: 20px;

    a {
      text-align: center;
      text-decoration: none;
      color: variables.$color-blue;

      &:hover {
        color: variables.$color-blue-hover;
      }
    }

    > div {
      display: flex;
      justify-content: space-evenly;
      margin-top: 20px;

      .button-default {
        font-weight: 500;
        width: 100%;
        padding: 12px;

        &:first-child {
          margin-right: 16px;
        }
      }
    }
  }
}
</style>

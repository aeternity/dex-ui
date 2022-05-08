<template>
  <div class="body">
    <div>
      <span>Pooled {{ token0.symbol }}:</span>
      <div>
        <div
          v-if="poolInfoImportFailed"
          class="error"
        >
          Loading Failed
          <div
            class="reload"
            @click="$emit('load:pool-info')"
          >
            <RefreshIcon :class="{rotating: poolInfoImporting}" />
          </div>
        </div>
        {{ getAmountText(amount0,token0) }}
        <img
          :class="{rotating: poolInfoImporting && !poolInfoImportFailed}"
          :src="`https://avatars.z52da5wt.xyz/${token0.cid}`"
        >
      </div>
    </div>
    <div>
      <span>Pooled {{ token1.symbol }}:</span>
      <div>
        {{ getAmountText(amount1,token1) }}
        <img
          :class="{rotating: poolInfoImporting && !poolInfoImportFailed}"
          :src="`https://avatars.z52da5wt.xyz/${token1.cid}`"
        >
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
      v-if="UNFINISHED_FEATURES"
      href="https://aeternity.com/"
      target="_blank"
    >
      View pool information
    </a>
    <div>
      <ButtonDefault
        class="liquidity-button"
        :to="{
          name: 'add-pool',
          query: {
            from: getTokenIdentifier(token0),
            to: getTokenIdentifier(token1)
          }
        }"
      >
        Add
      </ButtonDefault>
      <ButtonDefault
        class="liquidity-button"
        :to="`/pool/remove/${poolId}`"
      >
        Remove
      </ButtonDefault>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import ButtonDefault from './ButtonDefault.vue';
import { reduceDecimals } from '../lib/utils';
import RefreshIcon from '../assets/refresh.svg?vue-component';

export default {
  components: {
    ButtonDefault, RefreshIcon,
  },
  props: {
    poolId: { type: String, required: true },
    poolInfo: { type: Object, required: true },
    poolInfoImporting: { type: Boolean, required: false },
    poolInfoImportFailed: { type: Boolean, required: false },
  },
  emits: ['load:pool-info'],
  data: () => ({
    UNFINISHED_FEATURES: process.env.UNFINISHED_FEATURES,
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
      return this.calculateAmount(
        this.balance, this.totalSupply, this.supplyInfo?.token0.reserve,
      );
    },
    amount1() {
      return this.calculateAmount(
        this.balance, this.totalSupply, this.supplyInfo?.token1.reserve,
      );
    },
    shareText() {
      if (this.balance == null || !this.totalSupply) {
        return '-';
      }
      return BigNumber(this.balance).times(100).div(this.totalSupply).toFixed(6);
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
    getAmountText(amount, token) {
      return amount == null ? '-' : reduceDecimals(amount, token.decimals);
    },
    getTokenIdentifier(token) {
      if (!token) return null;
      return token.symbol === 'AE' ? token.symbol : token.cid;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/animations.scss';

.body {
  margin-top: 8px;

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    margin-top: 8px;

    img {
      height: 20px;
      width: 20px;
    }

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
    color: variables.$color-primary;

    &:hover {
      color: variables.$color-primary-light;
    }
  }

  .liquidity-button {
    color: variables.$color-white;
    background-color: variables.$color-gray;

    &:hover {
      background-color: variables.$color-gray-hover;
      color: variables.$color-white;
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

.error {
  color: variables.$color-red;

  .reload {
    padding: 0 5px;

    &:hover {
      cursor: pointer;
    }
  }
}

</style>

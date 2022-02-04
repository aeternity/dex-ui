<template>
  <div class="body">
    <div>
      <span>Pooled {{ token0.symbol }}:</span>
      <div>
        {{ getAmountText(amount0,token0) }}
        <img :src="`https://avatars.z52da5wt.xyz/${token0.cid}`">
      </div>
    </div>
    <div>
      <span>Pooled {{ token1.symbol }}:</span>
      <div>
        {{ getAmountText(amount1,token1) }}
        <img :src="`https://avatars.z52da5wt.xyz/${token1.cid}`">
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

export default {
  components: {
    ButtonDefault,
  },
  props: {
    poolId: { type: String, required: true },
    poolInfo: { type: Object, required: true },
  },
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
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

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
</style>
<template>
  <div class="body">
    <div>
      <span>
        <i18n-t keypath="liquidityDetails.pooled">
          <span class="symbol">{{ token0.symbol }}</span>
        </i18n-t>
      </span>
      <div>
        <div v-if="poolInfoImportFailed" class="error">
          {{ $t('liquidityDetails.loadingFailed') }}
          <div class="reload" @click="$emit('load:pool-info')" @keydown="$emit('load:pool-info')">
            <RefreshIcon :class="{ rotating: poolInfoImporting }" />
          </div>
        </div>
        {{ getAmountText(amount0, token0) }}
      </div>
    </div>
    <div>
      <span>
        <i18n-t keypath="liquidityDetails.pooled">
          <span class="symbol">{{ token1.symbol }}</span>
        </i18n-t>
      </span>
      <div>
        {{ getAmountText(amount1, token1) }}
      </div>
    </div>
    <div>
      <span>{{ $t('liquidityDetails.yourPoolTokens') }}:</span>
      <div>{{ balanceText }}</div>
    </div>
    <div>
      <span>{{ $t('confirmLiquidityModal.yourPoolShare') }}:</span>
      <div>{{ shareText }}%</div>
    </div>
  </div>
  <div class="buttons">
    <a
      v-if="UNFINISHED_FEATURES"
      href="https://aeternity.com/"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ $t('liquidityDetails.poolInformation') }}
    </a>
    <div>
      <ButtonDefault
        v-if="!withOneButton"
        class="liquidity-button"
        :to="{
          name: 'add-pool',
          query: {
            from: getTokenIdentifier(token0),
            to: getTokenIdentifier(token1),
          },
        }"
      >
        {{ $t('liquidityDetails.add') }}
      </ButtonDefault>
      <ButtonDefault
        class="liquidity-button"
        :to="withOneButton ? `/pool` : `/pool/remove/${poolId}`"
      >
        {{ $t(withOneButton ? 'liquidityDetails.ok' : 'liquidityDetails.remove') }}
      </ButtonDefault>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import { reduceDecimals } from '@/lib/utils';
import RefreshIcon from '@/assets/refresh.svg';
import ButtonDefault from './ButtonDefault.vue';

export default {
  components: {
    ButtonDefault,
    RefreshIcon,
  },
  props: {
    poolId: { type: String, required: true },
    poolInfo: { type: Object, required: true },
    poolInfoImporting: { type: Boolean, required: false },
    poolInfoImportFailed: { type: Boolean, required: false },
    withOneButton: { type: Boolean, default: false },
  },
  emits: ['load:pool-info'],
  data: () => ({
    UNFINISHED_FEATURES: import.meta.env.UNFINISHED_FEATURES,
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
      return this.calculateAmount(this.balance, this.totalSupply, this.supplyInfo?.token0.reserve);
    },
    amount1() {
      return this.calculateAmount(this.balance, this.totalSupply, this.supplyInfo?.token1.reserve);
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
      return token.symbol === 'AE' ? token.symbol : token.contract_id;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/animations.scss';
@use '../styles/typography.scss';
@use '../styles/mixins.scss';

.body {
  margin-top: 8px;

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: variables.$color-white;
    padding: 12px 0;
    border-bottom: 2px solid rgb(143 150 172 / 10%);

    @extend %face-sans-15-medium;

    .symbol {
      color: variables.$color-white;
    }

    span {
      color: variables.$color-gray2;
    }

    div {
      display: flex;
      align-items: center;

      svg {
        margin-left: 4px;
        height: 20px;
        width: 20px;
      }
    }
  }

  > div:last-child {
    border: none;
  }

  @include mixins.phone {
    > div,
    span {
      display: block;
      text-align: left;
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

      &:nth-child(2) {
        margin-left: 16px;
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

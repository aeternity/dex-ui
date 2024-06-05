<template>
  <div class="remove-liquidity">
    <MainWrapper :title="$t('removeLiquidity.title')" back-button settings>
      <Head>
        <title>Remove Liquidity - Superhero DEX</title>
      </Head>
      <div v-if="tokenA && tokenB" class="header">
        <div>
          <TokenIcon :token-a="tokenA" :token-b="tokenB" />
          <span>{{ `${tokenA.symbol}/${tokenB.symbol}` }}</span>
        </div>
      </div>
      <div class="remove-container">
        <div class="remove-subheader">
          <div>{{ $t('removeLiquidity.removeAmount') }}</div>
          <!-- <ButtonPlain
            v-if="UNFINISHED_FEATURES"
            @click="detailed = !detailed"
          >
            {{ detailed ? 'Simple' : 'Detailed' }}
          </ButtonPlain> -->
        </div>
        <div class="percentage">
          <span>{{ percentage }}%</span>
        </div>
        <template v-if="!detailed">
          <InputRange :value="percentage" @update="updatePercent($event)" />
          <div class="percentage-btns">
            <ButtonDefault fill="light" @click="updatePercent(25)"> 25% </ButtonDefault>
            <ButtonDefault fill="light" @click="updatePercent(50)"> 50% </ButtonDefault>
            <ButtonDefault fill="light" @click="updatePercent(75)"> 75% </ButtonDefault>
            <ButtonDefault fill="light" @click="updatePercent(100)"> 100% </ButtonDefault>
          </div>
        </template>
      </div>
      <InputToken v-if="detailed" />
      <div class="arrow-wrapper">
        <div class="arrow-down">
          <DownArrow />
        </div>
      </div>
      <template v-if="detailed">
        <InputToken />
        <PlusIcon />
        <InputToken />
      </template>
      <div v-else-if="share" class="remove-container">
        <div class="token-row">
          <TokenIcon :token-a="tokenA" :token-b="tokenB" />
          <span>
            {{ `${tokenA.symbol}/${tokenB.symbol}` }}
          </span>
          <div class="amount">
            {{ poolTokenInput.toFixed(5) }}
          </div>
        </div>
        <div class="token-row">
          <TokenIcon :token-a="tokenA" />
          <span>
            {{ tokenA.symbol }}
          </span>
          <div class="amount">
            {{ tokenAInput.toFixed(5) }}
          </div>
        </div>
        <div class="token-row">
          <TokenIcon :token-a="tokenB" />
          <span>
            {{ tokenB.symbol }}
          </span>
          <div class="amount">
            {{ tokenBInput.toFixed(5) }}
          </div>
        </div>
      </div>
      <div v-if="position" class="pool-info">
        <div class="space-between">
          {{ $t('removeLiquidity.yourPosition') }}
        </div>
        <div class="space-between">
          <span>{{ $t('price') }}</span>
          <div>
            {{ `1 ${tokenA.symbol} = ${ratioB.toFixed(5)} ${tokenB.symbol}` }} <br />
            {{ `1 ${tokenB.symbol} = ${ratioA.toFixed(5)} ${tokenA.symbol}` }}
          </div>
        </div>
        <div class="space-between">
          <span>{{ $t('liquidityDetails.pooled') }} {{ tokenA.symbol }}</span>
          <div>
            {{ (positionBalance(reserveA) * share).toFixed(5) }}
          </div>
        </div>
        <div class="space-between">
          <span>{{ $t('liquidityDetails.pooled') }} {{ tokenB.symbol }}</span>
          <div>
            {{ (positionBalance(reserveB) * share).toFixed(5) }}
          </div>
        </div>
        <div class="space-between">
          <span>
            {{ $t('liquidityDetails.yourPoolTokens') }}
          </span>
          <div>
            {{ positionBalance(position).toFixed(5) }}
          </div>
        </div>
        <div class="space-between">
          <span>{{ $t('confirmLiquidityModal.yourPoolShare') }}</span>
          <div>{{ (share * 100).toFixed(5) }}%</div>
        </div>
      </div>
      <div class="btns-row">
        <ButtonDefault
          v-if="!address"
          fill="transparent-blue"
          class="connect-btn"
          :disabled="connectingToWallet"
          :spinner="connectingToWallet"
          :class="{ loading: connectingToWallet }"
          @click="connectWallet"
        >
          {{ $t('connectWallet') }}
        </ButtonDefault>
        <ButtonDefault
          v-if="address"
          class="remove-btn"
          :class="{ transparent: enoughAllowance }"
          :disabled="!approveButtonEnabled"
          @click="approve"
        >
          {{ approveButtonMessage }}
        </ButtonDefault>
        <ButtonDefault
          v-if="address"
          class="remove-btn"
          :class="{ transparent: !enoughAllowance }"
          :disabled="!removeButtonEnabled"
          data-cy="remove-liquidity-btn"
          @click="handleRemove"
        >
          {{ removing ? $t('removeLiquidity.removing') : $t('liquidityDetails.remove') }}
        </ButtonDefault>
      </div>
    </MainWrapper>
  </div>
</template>

<script>
import { Head } from '@vueuse/head';
import BigNumber from 'bignumber.js';
import { mapGetters, mapState } from 'vuex';
import MainWrapper from '@/components/MainWrapper.vue';
import ButtonDefault from '@/components/ButtonDefault.vue';
import InputRange from '@/components/InputRange.vue';
import InputToken from '@/components/InputToken.vue';
import TokenIcon from '@/components/TokenIcon.vue';

import DownArrow from '@/assets/arrow-down.svg';
import PlusIcon from '@/assets/plus.svg';
import approvalMixin from '@/mixins/allowanceMixin';
import {
  handleUnknownError,
  reduceDecimals,
  expandDecimals,
  getAePair,
  getPairId,
} from '@/lib/utils';

export default {
  components: {
    MainWrapper,
    TokenIcon,
    ButtonDefault,
    InputRange,
    InputToken,
    DownArrow,
    PlusIcon,
    Head,
  },
  mixins: [approvalMixin],
  data() {
    return {
      detailed: false,
      percentage: 0,
      approved: false,
      approving: false,
      // we cache multiple allowances in order to prepare the solution for
      // when the user will be able to select manually different tokens
      removing: false,
      tokenA: null,
      tokenB: null,
      reserveA: null,
      reserveB: null,
      position: null,
      totalSupply: null,
      UNFINISHED_FEATURES: import.meta.env.UNFINISHED_FEATURES,
    };
  },
  computed: {
    ...mapState({
      address: 'address',
      factory: (state) => state.aeternity.factory?.$options.address,
    }),
    ...mapState('aeternity', ['slippage']),
    ...mapGetters('tokens', ['getAvailableTokens']),
    tokenAInput() {
      return this.positionBalance(this.reserveA ?? 0)
        .times(this.share)
        .times(this.percentage / 100);
    },
    tokenBInput() {
      return this.positionBalance(this.reserveB ?? 0)
        .times(this.share)
        .times(this.percentage / 100);
    },
    poolTokenInput() {
      return this.positionBalance(this.position ?? 0).times(this.percentage / 100);
    },
    share() {
      return this.totalSupply
        ? BigNumber(this.position ?? 0)
            .div(this.totalSupply)
            .toNumber()
        : 0;
    },
    pairId() {
      return getPairId(this.tokenA.contract_id, this.tokenB.contract_id);
    },
    enoughAllowance() {
      if (!this.tokenA || !this.tokenB || !this.poolTokenInput) return false;
      return this.enoughTokenAllowance(this.pairId, this.poolTokenInput, 18);
    },
    ratioA() {
      if (!this.reserveA || !this.reserveB || !this.tokenA || !this.tokenB) {
        return null;
      }
      return reduceDecimals(this.reserveA, this.tokenA.decimals)
        .div(reduceDecimals(this.reserveB, this.tokenB.decimals))
        .toNumber();
    },
    ratioB() {
      if (!this.reserveA || !this.reserveB || !this.tokenA || !this.tokenB) {
        return null;
      }
      return reduceDecimals(this.reserveB, this.tokenB.decimals)
        .div(reduceDecimals(this.reserveA, this.tokenA.decimals))
        .toNumber();
    },
    approveButtonEnabled() {
      return (
        !this.fetchingAllowance &&
        !this.enoughAllowance &&
        !this.approving &&
        this.poolTokenInput.gt(0)
      );
    },
    removeButtonEnabled() {
      return this.enoughAllowance && !this.approving && !this.removing && this.poolTokenInput.gt(0);
    },
    approveButtonMessage() {
      if (this.approving) return `${this.$t('approving')}...`;
      if (this.fetchingAllowance) return `${this.$t('verifyingApproval')}...`;
      if (this.enoughAllowance) return this.$t('approved');
      return this.$t('approve');
    },
  },
  watch: {
    async address(newVal) {
      if (newVal && this.pairId) {
        await this.refreshAllowance(this.pairId, this.fetchAlowance);
      }
    },
  },
  async mounted() {
    const [tokenAContract, tokenBContract] = this.$route.params.id.split('|');
    await this.$watchUntilTruly(() => this.$store.state.aeternity.factory);
    this.tokenA = this.getAvailableTokens().find((t) => t.contract_id === tokenAContract);
    this.tokenB = this.getAvailableTokens().find((t) => t.contract_id === tokenBContract);
    await this.setPairInfo();
    if (this.pairId) {
      await this.refreshAllowance(this.pairId, this.fetchAlowance);
    }
  },
  methods: {
    async connectWallet() {
      this.$store.dispatch('modals/open', { name: 'connect-wallet' });
    },
    generateRemoveLiquidityMessage() {
      return this.$t('removeLiquidity.transactionMessage', {
        tokenAAmount: this.tokenAInput.toFixed(5),
        tokenASymbol: this.tokenA.symbol,
        tokenBAmount: this.tokenBInput.toFixed(5),
        tokenBSymbol: this.tokenB.symbol,
      });
    },
    fetchAlowance() {
      return this.$store.dispatch('aeternity/getRouterPairAllowance', {
        tokenA: this.tokenA.contract_id,
        tokenB: this.tokenB.contract_id,
      });
    },
    async approve() {
      try {
        this.approving = true;
        await this.$store.dispatch('aeternity/createPairAllowance', {
          tokenA: this.tokenA,
          tokenB: this.tokenB,
          amount: expandDecimals(this.poolTokenInput, 18),
        });
        await this.safeRefreshAllowance(this.pairId, this.poolTokenInput, 18, this.fetchAlowance);
      } catch (e) {
        this.approved = false;
        await this.$store.dispatch('showUnknownError', e);
      } finally {
        this.approving = false;
      }
    },
    updatePercent(p) {
      this.percentage = p;
      this.approved = false;
    },
    async removalProcess() {
      let result;
      const aePair = getAePair(this.tokenA, this.tokenB, this.tokenAInput, this.tokenBInput);
      const liquidity = expandDecimals(this.poolTokenInput, 18);
      if (!aePair) {
        result = await this.$store.dispatch('aeternity/removeLiquidity', {
          tokenA: this.tokenA.contract_id,
          tokenB: this.tokenB.contract_id,
          liquidity,
          amountADesired: expandDecimals(this.tokenAInput, this.tokenA.decimals),
          amountBDesired: expandDecimals(this.tokenBInput, this.tokenB.decimals),
          transactionInfo: this.generateRemoveLiquidityMessage(),
        });
      } else {
        const { token, isTokenFrom } = aePair;
        result = await this.$store.dispatch('aeternity/removeLiquidityAe', {
          token: token.contract_id,
          liquidity,
          amountTokenDesired: isTokenFrom
            ? expandDecimals(this.tokenAInput, this.tokenA.decimals)
            : expandDecimals(this.tokenBInput, this.tokenB.decimals),
          amountAEDesired: isTokenFrom
            ? expandDecimals(this.tokenBInput, this.tokenB.decimals)
            : expandDecimals(this.tokenAInput, this.tokenA.decimals),
          transactionInfo: this.generateRemoveLiquidityMessage(),
        });
      }
      return result;
    },
    async handleRemove() {
      try {
        this.removing = true;
        await this.$store.dispatch('modals/open', {
          name: 'confirm-liquidity',
          isAdding: false,
          tokenA: this.tokenA,
          tokenB: this.tokenB,
          pairAmount: this.poolTokenInput,
          amountA: this.tokenAInput,
          amountB: this.tokenBInput,
          ratio: this.ratioA,
        });
        await this.$store.dispatch('modals/open', {
          name: 'submit-transaction',
          submitMessage: this.generateRemoveLiquidityMessage(),
          work: this.removalProcess,
        });
      } catch (e) {
        if (e.message === 'Rejected by user') return;
        await this.$store.dispatch('showUnknownError', e);
      } finally {
        await this.setPairInfo();
        await this.refreshAllowance(this.pairId, this.fetchAlowance);
        this.updatePercent(0);
        this.removing = false;
      }
    },
    positionBalance(amount) {
      return reduceDecimals(amount, 18);
    },
    async setPairInfo() {
      try {
        if (!this.tokenA || !this.tokenB || !this.address) {
          return;
        }
        [this.totalSupply, this.reserveA, this.reserveB] = await this.$store.dispatch(
          'aeternity/getPairInfo',
          {
            tokenA: this.tokenA,
            tokenB: this.tokenB,
          },
        );
        const position = await this.$store.dispatch('aeternity/pullAccountLiquidity', {
          tokenA: this.tokenA.contract_id,
          tokenASymbol: this.tokenA.symbol,
          tokenADecimals: this.tokenA.decimals,
          tokenB: this.tokenB.contract_id,
          tokenBSymbol: this.tokenB.symbol,
          tokenBDecimals: this.tokenB.decimals,
        });
        this.position = position;
      } catch (e) {
        handleUnknownError(e);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';
@use '../styles/mixins.scss';

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px;
  border-radius: 20px;
  background-color: variables.$color-black2;
  margin-bottom: 12px;

  img {
    height: 24px;
    width: 24px;
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

.remove-liquidity {
  margin-bottom: 80px;

  .remove-container {
    border-radius: 20px;
    padding: 16px;
    margin: 6px 0;
    color: variables.$color-white;
    background: variables.$color-black2;

    .remove-subheader {
      display: flex;
      justify-content: space-between;
      color: variables.$color-gray2;

      .button-plain {
        font-size: 16px;
        color: variables.$color-primary;

        &:hover {
          color: variables.$color-primary-light;
        }
      }
    }

    .percentage {
      text-align: right;
      color: variables.$color-white;

      @extend %face-sans-24-bold;
    }

    .percentage-btns {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;

      .button-default {
        padding: 8px 16px;
        margin: 4px 0;
        border-radius: 16px;
        font-size: 16px;
      }

      @include mixins.phone {
        display: block;

        .button-default {
          margin: 4px;
        }
      }
    }

    .token-row {
      display: flex;
      align-items: center;
      padding: 6px 0;

      @extend %face-sans-22-medium;

      .amount {
        flex-grow: 1;
        text-align: right;
      }

      .token-icon {
        margin-right: 12px;
        margin-left: 4px;
      }
    }
  }

  .arrow-wrapper {
    position: absolute;
    left: 0;
    right: 0;

    .arrow-down {
      height: 34px;
      width: 34px;
      border-radius: 24px;
      border: 4px solid variables.$color-modal-bg;
      background: variables.$color-black2;
      margin: -20px auto;
      align-items: center;
      display: flex;
      justify-content: center;

      svg {
        width: 16px;
      }
    }
  }

  .space-between {
    display: flex;
    justify-content: space-between;
    color: variables.$color-white;
  }

  .btns-row {
    margin-top: 10px;

    .connect-btn {
      &.loading {
        padding: 0;
      }

      :deep(svg) {
        height: 52px;
        width: 52px;
      }
    }

    .button-default {
      width: 100%;
      padding: 16px;
      margin-top: 8px;

      @extend %face-sans-16-medium;
    }
  }

  .input-token {
    margin: 20px 0;
  }

  .pool-info {
    @extend %face-sans-15-medium;

    .space-between {
      padding: 12px 0;
      border-bottom: 2px solid rgb(143 150 172 / 10%);
    }

    .space-between:last-child,
    .space-between:first-child {
      border: none;
    }

    span {
      color: variables.$color-gray2;
    }
  }
}
</style>

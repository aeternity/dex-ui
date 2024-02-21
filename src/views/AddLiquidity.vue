<template>
  <MainWrapper :title="$t('addLiquidity.title')" back-button settings class="add-liquidity">
    <Head>
      <title>Add Liquidity - Superhero DEX</title>
    </Head>
    <Tip :tip="$t('liquidityTip')" />
    <InputToken
      :value="amountTokenA"
      :token="tokenA"
      :ae-vs-wae="tokenA?.contract_id === WAE || tokenB?.contract_id === WAE"
      :chosen-tokens="[tokenA, tokenB]"
      @update:value="setAmount($event, true)"
      @update:token="setSelectedToken($event, true)"
      @update:balance="balanceTokenA = $event"
    />
    <div class="plus">
      <PlusIcon />
    </div>
    <InputToken
      :value="amountTokenB"
      :token="tokenB"
      :ae-vs-wae="tokenA?.contract_id === WAE || tokenB?.contract_id === WAE"
      :chosen-tokens="[tokenB, tokenA]"
      @update:value="setAmount($event, false)"
      @update:token="setSelectedToken($event, false)"
      @update:balance="balanceTokenB = $event"
    />

    <div v-if="tokenB && tokenA" class="pool-info">
      <div class="header">
        {{ $t('addLiquidity.pricePoolShare') }}
      </div>
      <div v-if="fetchingPairInfo" class="body fetching-pair-info">
        <AnimatedSpinner />
        <span>{{ $t('fetchPrice') }}...</span>
      </div>
      <div v-else class="body">
        <div>
          <span>
            {{ $t('confirmLiquidityModal.rates') }}
          </span>
          <span>
            1 {{ tokenA.symbol }} = {{ ratio ? (1 / ratio).toFixed(8) : '-' }} {{ tokenB.symbol }}
            <br />
            1 {{ tokenB.symbol }} = {{ ratio?.toFixed(8) ?? '-' }} {{ tokenA.symbol }}
          </span>
        </div>
        <div>
          <span>
            {{ $t('confirmLiquidityModal.yourPoolShare') }}
          </span>
          <span> {{ share ? share.toFixed(8) : '0.00000000' }} % </span>
        </div>
      </div>
    </div>
    <ButtonDefault
      v-if="!isDisabled && address"
      :disabled="enoughAllowance || inProgress || fetchingAllowance || fetchingPairInfo"
      @click="approve"
    >
      {{ approveButtonMessage }}
    </ButtonDefault>
    <ButtonDefault
      :disabled="address && (isDisabled || inProgress || !enoughAllowance || fetchingPairInfo)"
      :spinner="connectingToWallet"
      :class="{ loading: connectingToWallet }"
      @click="clickHandler"
    >
      {{ buttonMessage }}
    </ButtonDefault>
  </MainWrapper>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { Head } from '@vueuse/head';
import BigNumber from 'bignumber.js';
import MainWrapper from '@/components/MainWrapper.vue';
import Tip from '@/components/Tip.vue';
import InputToken from '@/components/InputToken.vue';
import ButtonDefault from '@/components/ButtonDefault.vue';
import { reduceDecimals, expandDecimals, getAePair } from '@/lib/utils';
import { MAGNITUDE, MINIMUM_LIQUIDITY } from '@/lib/constants';
import PlusIcon from '@/assets/plus.svg';
import AnimatedSpinner from '@/assets/animated-spinner.svg';
import saveTokenSelectionMixin from '@/mixins/saveTokenSelectionMixin';
import setTokenPairInfoMixin from '@/mixins/setTokenPairInfoMixin';
import approvalMixin from '@/mixins/allowanceMixin';

export default {
  components: {
    MainWrapper,
    InputToken,
    ButtonDefault,
    PlusIcon,
    AnimatedSpinner,
    Head,
    Tip,
  },
  mixins: [saveTokenSelectionMixin, approvalMixin, setTokenPairInfoMixin],
  data: () => ({
    tokenB: null,
    tokenA: null,
    amountTokenA: '',
    amountTokenB: '',
    isLastInputTokenA: true,
    totalSupply: null,
    balanceTokenA: null,
    balanceTokenB: null,
    reserveTokenA: null,
    reserveTokenB: null,
    approving: false,
    supplying: false,
  }),
  computed: {
    ...mapState(['address', 'connectingToWallet']),
    ...mapState('aeternity', ['slippage', 'fetchingPairInfo']),
    ...mapGetters(['WAE']),
    inProgress() {
      return this.approving || this.supplying || this.connectingToWallet;
    },
    liquidity() {
      if (!this.tokenA || !this.tokenB || !this.amountTokenA || !this.amountTokenB) {
        return 0;
      }
      const amountTokenA = expandDecimals(this.amountTokenA, this.tokenA.decimals);
      const amountTokenB = expandDecimals(this.amountTokenB, this.tokenB.decimals);

      // if there is no pair yet we have a special
      // case for the first provided liquidity
      if (!this.reserveTokenA || !this.reserveTokenB || !this.totalSupply) {
        return BigNumber(amountTokenA).times(amountTokenB).sqrt().minus(MINIMUM_LIQUIDITY);
      }
      const liquidityTokenA = (amountTokenA * this.totalSupply) / this.reserveTokenA;
      const liquidityTokenB = (amountTokenB * this.totalSupply) / this.reserveTokenB;
      return liquidityTokenA < liquidityTokenB ? liquidityTokenA : liquidityTokenB;
    },
    share() {
      if (!this.totalSupply && this.amountTokenA && this.amountTokenB) {
        return 100;
      }
      if (
        !this.reserveTokenA ||
        !this.reserveTokenB ||
        !this.tokenA ||
        !this.tokenB ||
        !this.amountTokenA ||
        !this.amountTokenB
      ) {
        return null;
      }
      const amountTokenA = expandDecimals(this.amountTokenA, this.tokenA.decimals);
      const amountTokenB = expandDecimals(this.amountTokenB, this.tokenB.decimals);
      const amount = amountTokenA * amountTokenB;
      const reserve = this.reserveTokenB * this.reserveTokenA;
      return BigNumber(amount).times(100).div(reserve).toNumber();
    },
    ratio() {
      if (!this.reserveTokenA || !this.reserveTokenB || !this.tokenA || !this.tokenB) {
        return null;
      }
      return reduceDecimals(this.reserveTokenA, this.tokenA.decimals)
        .div(reduceDecimals(this.reserveTokenB, this.tokenB.decimals))
        .toNumber();
    },
    enoughBalanceTokenA() {
      return this.balanceTokenA?.isGreaterThanOrEqualTo(this.amountTokenA);
    },
    enoughBalanceTokenB() {
      return this.balanceTokenB?.isGreaterThanOrEqualTo(this.amountTokenB);
    },
    isDisabled() {
      return (
        !this.tokenB ||
        !this.tokenA ||
        +this.amountTokenA <= 0 ||
        !this.enoughBalanceTokenB ||
        !this.enoughBalanceTokenA
      );
    },
    approveButtonMessage() {
      if (this.approving) return `${this.$t('approving')}...`;
      if (this.fetchingAllowance) return `${this.$t('verifyingApproval')}...`;
      if (this.enoughAllowance) return this.$t('approved');
      return this.$t('approve');
    },
    buttonMessage() {
      if (!this.address) return this.$t('connectWallet');
      if (this.supplying) return `${this.$t('supplying')}...`;
      if (+this.amountTokenA <= 0 || !this.amountTokenB || !this.tokenA || !this.tokenB)
        return this.$t('enterAmount');
      if (!this.enoughBalanceTokenA)
        return this.$t('insufficientBalance', { msg: this.tokenA.symbol });
      if (!this.enoughBalanceTokenB)
        return this.$t('insufficientBalance', { msg: this.tokenB.symbol });
      return this.$t('supply');
    },
    enoughAllowance() {
      if (!this.tokenA || !this.tokenB) return false;
      const enough = (token, amount) =>
        token.is_ae || this.enoughTokenAllowance(token.contract_id, amount, token.decimals);

      return enough(this.tokenA, this.amountTokenA) && enough(this.tokenB, this.amountTokenB);
    },
  },
  watch: {
    async address(newVal) {
      if (newVal) {
        await this.refreshAllowances();
      }
    },
  },
  methods: {
    generateAddLiquidityMessage(isFinished) {
      return `${isFinished ? this.$t('provide') : this.$t('providing')} ${this.$t('liquidityOf')} ${this.amountTokenA} ${this.tokenA.symbol}
        ${this.$t('and')} ${this.amountTokenB} ${this.tokenB.symbol}`;
    },
    async approve() {
      try {
        this.approving = true;
        const aePair = getAePair(this.tokenA, this.tokenB, this.amountTokenA, this.amountTokenB);
        if (!aePair) {
          await this.createAndRefreshAllowance(this.tokenA, this.amountTokenA);
          await this.createAndRefreshAllowance(this.tokenB, this.amountTokenB);
        } else {
          await this.createAndRefreshAllowance(aePair.token, aePair.tokenAmount);
        }
      } catch (e) {
        await this.$store.dispatch('showUnknownError', e);
      } finally {
        this.approving = false;
      }
    },
    async clickHandler() {
      if (this.address) {
        this.supply();
      } else {
        this.$store.dispatch('modals/open', { name: 'connect-wallet' });
      }
    },
    async refreshAllowances() {
      if (this.tokenA && !this.tokenA.is_ae) {
        await this.refreshAllowance(this.tokenA?.contract_id, this.fetchAllowance);
      }
      if (this.tokenB && !this.tokenB.is_ae) {
        await this.refreshAllowance(this.tokenB?.contract_id, this.fetchAllowance);
      }
    },
    async supplyProcess() {
      let result;
      const aePair = getAePair(this.tokenA, this.tokenB, this.amountTokenA, this.amountTokenB);
      this.supplying = true;
      // if none of the selected tokens are WAE
      if (!aePair) {
        result = await this.$store.dispatch('aeternity/addLiquidity', {
          tokenA: this.tokenA.contract_id,
          tokenB: this.tokenB.contract_id,
          amountADesired: expandDecimals(this.amountTokenA, this.tokenA.decimals),
          amountBDesired: expandDecimals(this.amountTokenB, this.tokenB.decimals),
          minimumLiquidity: MINIMUM_LIQUIDITY,
          transactionInfo: this.generateAddLiquidityMessage(true),
        });
        // to refresh liquidity list
        await this.$store.dispatch('aeternity/pullAccountLiquidity', {
          tokenA: this.tokenA.contract_id,
          tokenB: this.tokenB.contract_id,
          tokenASymbol: this.tokenA.symbol,
          tokenBSymbol: this.tokenB.symbol,
          tokenADecimals: this.tokenA.decimals,
          tokenBDecimals: this.tokenB.decimals,
        });
      } else {
        result = await this.$store.dispatch('aeternity/addLiquidityAe', {
          token: aePair.token.contract_id,
          amountTokenDesired: expandDecimals(aePair.tokenAmount, aePair.token.decimals),
          amountAeDesired: expandDecimals(aePair.aeAmount, aePair.wae.decimals),
          minimumLiquidity: MINIMUM_LIQUIDITY,
          transactionInfo: this.generateAddLiquidityMessage(true),
        });

        // to refresh liquidity list
        await this.$store.dispatch('aeternity/pullAccountLiquidity', {
          tokenA: aePair.token.contract_id,
          tokenASymbol: aePair.token.symbol,
          tokenADecimals: aePair.token.decimals,
          tokenB: aePair.wae.contract_id,
          tokenBSymbol: aePair.wae.symbol,
          tokenBDecimals: aePair.wae.decimals,
        });
      }
      return result;
    },
    async supply() {
      try {
        await this.$store.dispatch('modals/open', {
          name: 'confirm-liquidity',
          tokenA: this.tokenA,
          tokenB: this.tokenB,
          amountA: BigNumber(this.amountTokenA),
          amountB: BigNumber(this.amountTokenB),
          ratio: this.ratio,
          pairAmount: reduceDecimals(this.liquidity, MAGNITUDE),
          share: this.share,
          isAdding: true,
        });
        await this.$store.dispatch('modals/open', {
          name: 'submit-transaction',
          submitMessage: this.generateAddLiquidityMessage(),
          work: this.supplyProcess,
        });
      } catch (e) {
        if (e.message === 'Rejected by user') return;
        await this.$store.dispatch('showUnknownError', e);
      } finally {
        await this.setPairInfo();
        this.amountTokenA = null;
        this.amountTokenB = null;
        await this.refreshAllowances();
        this.isLastInputTokenA = true;
        this.$store.commit('navigation/setPool', null);
        this.supplying = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';
@use '../styles/mixins.scss';

.add-liquidity {
  .input-token {
    margin: 12px 0;
  }

  .info {
    color: variables.$color-gray2;
    text-align: left;
    padding-bottom: 4px;
    line-height: 20px;

    @extend %face-sans-14-medium;
  }

  .plus {
    width: 30px;
    height: 30px;
    border-radius: 24px;
    background-color: variables.$color-black2;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      height: 28px;
    }
  }

  .button-default {
    width: 100%;
    padding: 16px;
    margin-top: 8px;

    @extend %face-sans-20-medium;

    &.loading {
      padding: 0;
    }

    &.allowance-button {
      font-size: 16px;
      justify-content: space-between;
      margin-bottom: 12px;

      &,
      div {
        display: flex;
        align-items: center;
      }

      .allowance {
        max-width: 350px;

        svg {
          margin-right: 8px;
        }
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }

    :deep(.spinner) {
      height: 50px;
      width: 50px;
    }
  }

  .pool-info {
    color: white;
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    font-weight: 500;

    .header {
      text-align: left;
    }

    .header,
    .body {
      padding: 16px 16px 0;
    }

    .body {
      div {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-top: 12px;
        padding-bottom: 12px;
        border-bottom: 2px solid variables.$color-black2;

        &:last-child {
          border: none;
        }

        span:first-of-type {
          margin-right: 4px;
          color: variables.$color-gray2;
        }
      }

      &.fetching-pair-info {
        display: inline-flex;
        align-items: center;
        margin: 0 auto;

        svg {
          width: 32px;
        }
      }
    }

    @include mixins.phone {
      .body {
        display: block;
        text-align: left;

        div {
          padding-bottom: 10px;
        }
      }
    }
  }
}
</style>

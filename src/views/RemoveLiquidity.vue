<template>
  <div class="remove-liquidity">
    <MainWrapper
      title="Remove Liquidity"
      back-button
      settings
    >
      <Tip
        :tip="`When you add liquidity, you will receive pool tokens representing your position.
      These tokens automatically earn fees proportional
      to your share of the pool, and can be redeemed at any time.`"
      />

      <div class="remove-container">
        <div class="remove-subheader">
          <div>Remove amount</div>
          <ButtonPlain
            v-if="UNFINISHED_FEATURES"
            @click="detailed = !detailed"
          >
            {{ detailed ? 'Simple' : 'Detailed' }}
          </ButtonPlain>
        </div>
        <div class="percentage">
          <span>{{ percentage }}%</span>
        </div>
        <template v-if="!detailed">
          <InputRange
            :value="percentage"
            @update="updatePercent($event)"
          />
          <div class="percentage-btns">
            <ButtonDefault
              :fill="'transparent-blue'"
              @click="updatePercent(25)"
            >
              25%
            </ButtonDefault>
            <ButtonDefault
              :fill="'transparent-blue'"
              @click="updatePercent(50)"
            >
              50%
            </ButtonDefault>
            <ButtonDefault
              :fill="'transparent-blue'"
              @click="updatePercent(75)"
            >
              75%
            </ButtonDefault>
            <ButtonDefault
              :fill="'transparent-blue'"
              @click="updatePercent(100)"
            >
              Max
            </ButtonDefault>
          </div>
        </template>
      </div>
      <InputToken v-if="detailed" />
      <DownArrow class="arrow-down" />
      <template v-if="detailed">
        <InputToken />
        <PlusIcon />
        <InputToken />
      </template>
      <div
        v-else-if="share"
        class="remove-container"
      >
        <div class="token-row">
          <div class="amount">
            {{ poolTokenInput.toFixed(5) }}
          </div>
          <img :src="`https://avatars.z52da5wt.xyz/${tokenA.contract_id}`">
          <img :src="`https://avatars.z52da5wt.xyz/${tokenB.contract_id}`">
          <span>
            {{ `${tokenA.symbol}/${tokenB.symbol}` }}
          </span>
        </div>
        <div class="token-row">
          <div class="amount">
            {{ tokenAInput.toFixed(5) }}
          </div>
          <img :src="`https://avatars.z52da5wt.xyz/${tokenA.contract_id}`">
          <span>
            {{ tokenA.symbol }}
          </span>
        </div>
        <div class="token-row">
          <div class="amount">
            {{ tokenBInput.toFixed(5) }}
          </div>
          <img :src="`https://avatars.z52da5wt.xyz/${tokenB.contract_id}`">
          <span>
            {{ tokenB.symbol }}
          </span>
        </div>
      </div>
      <div
        v-if="tokenA && tokenB && ratioA !== null"
        class="space-between"
      >
        <span>Price:</span>
        <span>{{ `1 ${tokenA.symbol} = ${ratioB.toFixed(5)} ${tokenB.symbol}` }}</span>
      </div>
      <div
        v-if="tokenA && tokenB && ratioB !== null"
        class="space-between"
      >
        <span />
        <span>{{ `1 ${tokenB.symbol} = ${ratioA.toFixed(5)} ${tokenA.symbol}` }}</span>
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
          Connect Wallet
        </ButtonDefault>
        <ButtonDefault
          v-if="address"
          class="remove-btn"
          :class="{'transparent' : enoughAllowance}"
          :disabled="!approveButtonEnabled"
          @click="approve"
        >
          {{ approveButtonMessage }}
        </ButtonDefault>
        <ButtonDefault
          v-if="address"
          class="remove-btn"
          :class="{'transparent' : !enoughAllowance}"
          :disabled="!removeButtonEnabled"
          @click="handleRemove"
        >
          {{ removing ? 'Removing...' : 'Remove' }}
        </ButtonDefault>
      </div>
    </MainWrapper>
    <div
      v-if="position"
      class="pool-info"
    >
      <div>
        <div class="space-between">
          <span>Your position</span>
        </div>
        <div class="space-between pool-token">
          <span>
            {{ `${tokenA.symbol}/${tokenB.symbol}` }}
          </span>
          <div>
            <span>{{ positionBalance(position).toFixed(5) }}</span>
            <img :src="`https://avatars.z52da5wt.xyz/${tokenA.contract_id}`">
            <img :src="`https://avatars.z52da5wt.xyz/${tokenB.contract_id}`">
          </div>
        </div>
        <div class="space-between">
          <span>Your pool share</span>
          <span>{{ (share*100).toFixed(5) }}%</span>
        </div>
        <div class="space-between">
          <span>{{ tokenA.symbol }}:</span>
          <span>{{ (positionBalance(reserveA)*share).toFixed(5) }}</span>
        </div>
        <div class="space-between">
          <span>{{ tokenB.symbol }}:</span>
          <span>{{ (positionBalance(reserveB)*share).toFixed(5) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js';
import { mapState } from 'vuex';
import Tip from '@/components/Tip.vue';
import MainWrapper from '@/components/MainWrapper.vue';
import ButtonPlain from '@/components/ButtonPlain.vue';
import ButtonDefault from '@/components/ButtonDefault.vue';
import InputRange from '@/components/InputRange.vue';
import InputToken from '@/components/InputToken.vue';
import {
  getPairId,
} from '../store/modules/aeternity';
import {
  handleUnknownError,
  reduceDecimals,
  expandDecimals,
  getAePair,
} from '../lib/utils';
import DownArrow from '../assets/arrow-down.svg?vue-component';
import PlusIcon from '../assets/plus.svg?vue-component';
import approvalMixin from '../mixins/allowanceMixin';

export default {
  components: {
    Tip,
    MainWrapper,
    ButtonPlain,
    ButtonDefault,
    InputRange,
    InputToken,
    DownArrow,
    PlusIcon,
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
      UNFINISHED_FEATURES: process.env.UNFINISHED_FEATURES,
    };
  },
  computed: {
    ...mapState({
      address: 'address',
      factory: (state) => state.aeternity.factory?.deployInfo.address,
    }),
    ...mapState('aeternity', ['slippage']),
    tokenAInput() {
      return this.positionBalance(this.reserveA ?? 0)
        .times(this.share).times(this.percentage / 100);
    },
    tokenBInput() {
      return this.positionBalance(this.reserveB ?? 0)
        .times(this.share).times(this.percentage / 100);
    },
    poolTokenInput() {
      return this.positionBalance(this.position ?? 0).times(this.percentage / 100);
    },
    share() {
      return this.totalSupply ? BigNumber(this.position ?? 0).div(this.totalSupply).toNumber() : 0;
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
        .div(reduceDecimals(this.reserveB, this.tokenB.decimals)).toNumber();
    },
    ratioB() {
      if (!this.reserveA || !this.reserveB || !this.tokenA || !this.tokenB) {
        return null;
      }
      return reduceDecimals(this.reserveB, this.tokenB.decimals)
        .div(reduceDecimals(this.reserveA, this.tokenA.decimals)).toNumber();
    },
    approveButtonEnabled() {
      return !this.fetchingAllowance && !this.enoughAllowance
          && !this.approving && this.poolTokenInput.gt(0);
    },
    removeButtonEnabled() {
      return this.enoughAllowance && !this.approving && !this.removing && this.poolTokenInput.gt(0);
    },
    approveButtonMessage() {
      if (this.approving) return 'Approving...';
      if (this.fetchingAllowance) return 'Verifying approval...';
      if (this.enoughAllowance) return 'Approved';
      return 'Approve';
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
    const tokenList = (
      this.$store.getters.activeNetwork && this.$store.getters.activeNetwork.tokens)
      ? this.$store.getters.activeNetwork.tokens : [];
    this.tokenA = tokenList.find((t) => t.contract_id === tokenAContract);
    this.tokenB = tokenList.find((t) => t.contract_id === tokenBContract);
    await this.setPairInfo();
    if (this.pairId) {
      await this.refreshAllowance(this.pairId, this.fetchAlowance);
    }
  },
  methods: {
    async connectWallet() {
      this.$store.dispatch('modals/open', { name: 'connect-wallet' });
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
          tokenA: this.tokenA.contract_id,
          tokenB: this.tokenB.contract_id,
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
      const aePair = getAePair(
        this.tokenA, this.tokenB, this.tokenAInput, this.tokenBInput,
      );
      const liquidity = expandDecimals(this.poolTokenInput, 18);
      if (!aePair) {
        result = await this.$store.dispatch('aeternity/removeLiquidity', {
          tokenA: this.tokenA.contract_id,
          tokenB: this.tokenB.contract_id,
          liquidity,
          amountADesired: expandDecimals(this.tokenAInput, this.tokenA.decimals),
          amountBDesired: expandDecimals(this.tokenBInput, this.tokenB.decimals),
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
          submitMessage: `Removing around ${this.poolTokenInput.toFixed(5)} ${this.tokenA.symbol}/${this.tokenB.symbol} pool tokens from the provided liquidity`,
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
        [
          this.totalSupply, this.reserveA, this.reserveB,
        ] = await this.$store.dispatch('aeternity/getPairInfo', {
          tokenA: this.tokenA,
          tokenB: this.tokenB,
        });
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

.remove-liquidity {
  margin-bottom: 80px;

  .remove-container {
    border-radius: 20px;
    padding: 16px;
    margin: 20px 0;
    color: variables.$color-white;
    border: 1px solid variables.$color-black;
    background: variables.$color-black2;

    .remove-subheader {
      display: flex;
      justify-content: space-between;

      .button-plain {
        font-size: 16px;
        color: variables.$color-blue;

        &:hover {
          color: variables.$color-blue-hover;
        }
      }
    }

    .percentage {
      font-size: 64px;
      text-align: left;
      font-weight: 500;
    }

    .percentage-btns {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;

      .button-default {
        padding: 8px 16px;
        margin: 4px;
        border-radius: 8px;
        font-size: 16px;
      }
    }

    .token-row {
      display: flex;
      align-items: center;
      font-size: 20px;
      font-weight: 500;

      .amount {
        flex-grow: 1;
        text-align: left;
      }

      img {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        margin-right: 12px;
      }

      img:nth-of-type(1) {
        margin-left: 4px;
        z-index: 1;
      }

      img:nth-of-type(2) {
        margin-left: -24px;
      }
    }
  }

  .arrow-down {
    width: 16px;
  }

  .space-between {
    display: flex;
    justify-content: space-between;
    color: variables.$color-white;
  }

  .btns-row {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;

    .connect-btn {
      width: 100%;
      padding: 16px;
      margin-top: 8px;
      font-size: 20px;
      font-weight: 500;

      &.loading {
        padding: 0;
      }

      :deep(svg) {
        height: 52px;
        width: 52px;
      }
    }

    .remove-btn {
      width: 48%;
      padding: 16px;
      margin-top: 8px;
      font-size: 20px;
      font-weight: 500;
    }
  }

  .input-token {
    margin: 20px 0;
  }

  .pool-info {
    max-width: 400px;
    background-color: variables.$color-black;
    color: variables.$color-white;
    margin: 1rem auto 0 auto;
    padding: 1rem;
    border-radius: 16px;

    .pool-token {
      font-weight: 500;
      font-size: 20px;

      img {
        width: 20px;
        height: 20px;
      }

      img:nth-of-type(1) {
        margin-left: 4px;
        z-index: 1;
      }

      img:nth-of-type(2) {
        margin-left: -10px;
      }
    }
  }
}
</style>

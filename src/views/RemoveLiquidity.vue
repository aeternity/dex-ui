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
        v-else
        class="remove-container"
      >
        <div
          v-if="share"
          class="token-row"
        >
          <div class="amount">
            {{ poolTokenInput.toFixed(5) }}
          </div>
          <img :src="`https://avatars.z52da5wt.xyz/${tokenA.contract_id}`">
          <img :src="`https://avatars.z52da5wt.xyz/${tokenB.contract_id}`">
          <span>
            {{ `${tokenA.symbol}/${tokenB.symbol}` }}
          </span>
        </div>
        <div
          v-if="tokenA"
          class="token-row"
        >
          <div class="amount">
            {{ tokenAInput.toFixed(5) }}
          </div>
          <img :src="`https://avatars.z52da5wt.xyz/${tokenA.contract_id}`">
          <span>
            {{ tokenA.symbol }}
          </span>
        </div>
        <div
          v-if="tokenB"
          class="token-row"
        >
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
          :class="{'transparent' : approved}"
          :disabled="!approveButtonEnabled"
          @click="approve"
        >
          {{ approveButtonMessage }}
        </ButtonDefault>
        <ButtonDefault
          v-if="address"
          class="remove-btn"
          :class="{'transparent' : !approved}"
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
  handleUnknownError,
  reduceDecimals,
  expandDecimals,
  getTokenList,
  getAePair,
} from '../lib/utils';
import DownArrow from '../assets/arrow-down.svg?vue-component';
import PlusIcon from '../assets/plus.svg?vue-component';

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
  data() {
    return {
      detailed: false,
      percentage: 0,
      tokenAInput: BigNumber(0),
      tokenBInput: BigNumber(0),
      poolTokenInput: BigNumber(0),
      approved: false,
      approving: false,
      removing: false,
      pairId: '',
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
    share() {
      return BigNumber(this.position).div(this.totalSupply).toNumber();
    },
    balanceA() {
      return this.reserveA.times(this.share).div(BigNumber(10).pow(18));
    },
    balanceB() {
      return BigNumber(this.reserveB).times(this.share).div(BigNumber(10).pow(18));
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
      return !this.approved && !this.approving && this.poolTokenInput.gt(0);
    },
    removeButtonEnabled() {
      return this.approved && !this.approving && !this.removing && this.poolTokenInput.gt(0);
    },
    approveButtonMessage() {
      if (this.approving) return 'Approving...';
      if (this.approved) return 'Approved';
      return 'Approve';
    },
  },
  async mounted() {
    this.pairId = this.$route.params.id;
    const [tokenAContract, tokenBContract] = this.pairId.split('|');
    await this.$watchUntilTruly(() => this.$store.state.aeternity.factory);
    const tokenList = getTokenList();
    this.tokenA = tokenList.find((t) => t.contract_id === tokenAContract);
    this.tokenB = tokenList.find((t) => t.contract_id === tokenBContract);
    await this.setPairInfo();
  },
  methods: {
    async connectWallet() {
      await this.$watchUntilTruly(() => this.$store.state.sdk);
      await this.$store.dispatch('connectWallet');
    },
    async approve() {
      try {
        this.approving = true;
        await this.$store.dispatch('aeternity/createPairAllowance', {
          tokenA: this.tokenA.contract_id,
          tokenB: this.tokenB.contract_id,
          amount: expandDecimals(this.poolTokenInput, 18),
        });
        this.approved = true;
      } catch (e) {
        this.approved = false;
        await this.$store.dispatch('showUnknownError', e);
      } finally {
        this.approving = false;
      }
    },
    updatePercent(p) {
      this.percentage = p;
      this.tokenAInput = this.positionBalance(this.reserveA).times(this.share).times(p / 100);
      this.tokenBInput = this.positionBalance(this.reserveB).times(this.share).times(p / 100);
      this.poolTokenInput = this.positionBalance(this.position).times(p / 100);
      this.approved = false;
    },
    async handleRemove() {
      try {
        this.removing = true;
        const aePair = getAePair(
          this.tokenA, this.tokenB, this.tokenAInput, this.tokenBInput,
        );
        const liquidity = expandDecimals(this.poolTokenInput, 18);
        if (!aePair) {
          await this.$store.dispatch('aeternity/removeLiquidity', {
            tokenA: this.tokenA.contract_id,
            tokenB: this.tokenB.contract_id,
            liquidity,
            amountADesired: expandDecimals(this.tokenAInput, this.tokenA.decimals),
            amountBDesired: expandDecimals(this.tokenBInput, this.tokenB.decimals),
          });
        } else {
          const { token, isTokenFrom } = aePair;
          await this.$store.dispatch('aeternity/removeLiquidityAe', {
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
        await this.setPairInfo();
        this.updatePercent(0);
      } catch (e) {
        if (e.message === 'Rejected by user') return;
        await this.$store.dispatch('showUnknownError', e);
      } finally {
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
        const {
          totalSupply,
          reserveA,
          reserveB,
        } = await this.$store.dispatch('aeternity/getPoolInfo', {
          tokenA: this.tokenA.contract_id,
          tokenB: this.tokenB.contract_id,
        });
        this.totalSupply = totalSupply;
        this.reserveA = BigNumber(reserveA);
        this.reserveB = BigNumber(reserveB);
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
        if (e.message !== 'PAIR NOT FOUND') {
          handleUnknownError(e);
        }
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

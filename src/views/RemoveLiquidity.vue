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
          <ButtonPlain @click="detailed = !detailed">
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
      <img
        src="../assets/arrow-down.svg"
        class="arrow-down"
      >
      <template v-if="detailed">
        <InputToken />
        <img src="../assets/plus.svg">
        <InputToken />
      </template>
      <div
        v-else
        class="remove-container"
      >
        <div class="token-row">
          <div class="amount">
            {{ formatBigNumber(firstAssetInput) }}
          </div>
          <img src="../assets/ae.svg">
          <span>
            AE
          </span>
        </div>
        <div class="token-row">
          <div class="amount">
            {{ formatBigNumber(secondAssetInput) }}
          </div>
          <img src="../assets/logo.png">
          <span>
            VUE
          </span>
        </div>
      </div>
      <div class="space-between">
        <span>Price:</span>
        <span>1 AE = 5 VUE</span>
      </div>
      <div class="space-between">
        <span />
        <span>1 VUE = 0.2 AE</span>
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
          :disabled="approved"
          @click="approved = true"
        >
          {{ approved? 'Approved' : 'Approve' }}
        </ButtonDefault>
        <ButtonDefault
          v-if="address"
          class="remove-btn"
          :class="{'transparent' : !approved}"
          :disabled="!approved"
          @click="handleRemove"
        >
          Remove
        </ButtonDefault>
      </div>
    </MainWrapper>
    <div class="pool-info">
      <div>
        <div class="space-between">
          <span>Your position</span>
        </div>
        <div class="space-between pool-token">
          <span>AE/VUE</span>
          <span>{{ formatBigNumber(poolToken) }}</span>
        </div>
        <div class="space-between">
          <span>Your pool share</span>
          <span>0.01%</span>
        </div>
        <div class="space-between">
          <span>AE:</span>
          <span>{{ formatBigNumber(firstAsset) }}</span>
        </div>
        <div class="space-between">
          <span>VUE:</span>
          <span>{{ formatBigNumber(secondAsset) }}</span>
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

export default {
  components: {
    Tip,
    MainWrapper,
    ButtonPlain,
    ButtonDefault,
    InputRange,
    InputToken,
  },
  props: {
    firstAsset: { type: BigNumber, default: BigNumber(0.00015) },
    secondAsset: { type: BigNumber, default: BigNumber(0.00000231212) },
    poolToken: { type: BigNumber, default: BigNumber(0.000000072) },
  },
  data() {
    return {
      detailed: false,
      percentage: 0,
      firstAssetInput: BigNumber(0),
      secondAssetInput: BigNumber(0),
      poolTokenInput: BigNumber(0),
      approved: false,
    };
  },
  computed: mapState(['address', 'connectingToWallet']),
  methods: {
    async connectWallet() {
      await this.$watchUntilTruly(() => this.$store.state.sdk);
      await this.$store.dispatch('connectWallet');
    },
    updatePercent(p) {
      this.percentage = p;
      this.firstAssetInput = this.firstAsset.multipliedBy(p / 100);
      this.secondAssetInput = this.secondAsset.multipliedBy(p / 100);
      this.poolTokenInput = this.poolToken.multipliedBy(p / 100);
    },
    handleRemove() {
      console.log('Pool removed');
    },
    formatBigNumber(value) {
      return value.toFormat();
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
      font-size: 72px;
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
      font-size: 24px;
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

    .connect-btn {
      width: 100%;
      padding: 16px;
      margin-top: 8px;
      font-size: 20px;
      font-weight: 500;

      &.loading {
        padding: 0;
      }

      ::v-deep img {
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
    }
  }
}
</style>

<template>
  <ModalDefault
    class="account-info-modal"
    title="Connected account"
    close
    @close="resolve"
  >
    <div class="box">
      <div class="wallet">
        <div class="title">
          Connected with {{ wallet ? wallet.name : '' }} Wallet
        </div>
        <div
          class="change-button"
          @click.prevent="disconnectWallet"
        >
          Disconnect
        </div>
      </div>
      <div class="content">
        <div class="address">
          <img :src="`https://avatars.z52da5wt.xyz/${address}`">
          <span>{{ `${address.slice(0,6)}...${address.slice(-3)}` }}</span>
        </div>
        <div class="links">
          <ClipboardCopy
            class="copy-address"
            title="Copy Address"
            :content="address"
          />
          <a
            v-if="activeNetwork"
            :href="`${activeNetwork.explorerUrl}/account/${address}`"
            target="_blank"
          >
            <ExternalLinkIcon />
            View in explorer
          </a>
        </div>
      </div>
    </div>
    <div class="recent-transactions">
      <template v-if="filteredTransactions.length">
        <div class="header">
          <span>Recent Transactions</span>
          <ButtonPlain @click="removeAllTransactions">
            (clear all)
          </ButtonPlain>
        </div>
        <a
          v-for="transaction in filteredTransactions"
          :key="transaction.hash"
          :href="`${activeNetwork.explorerUrl}/transactions/${transaction.hash}`"
          target="_blank"
          class="transaction"
        >
          <span>{{ transaction.info }}</span>
          <AnimatedSpinner v-if="transaction.pending" />
          <Alert
            v-else-if="transaction.error"
            class="error"
          />
          <Check v-else />
        </a>
      </template>
      <span v-else>Your transactions will appear here...</span>
    </div>
  </ModalDefault>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import ModalDefault from './ModalDefault.vue';
import ClipboardCopy from './ClipboardCopy.vue';
import ButtonPlain from './ButtonPlain.vue';
import ExternalLinkIcon from '../assets/external-link.svg?vue-component';
import AnimatedSpinner from '../assets/animated-spinner.svg?skip-optimize';
import Alert from '../assets/alert.svg?vue-component';
import Check from '../assets/check.svg?vue-component';

export default {
  components: {
    ModalDefault,
    ClipboardCopy,
    ButtonPlain,
    ExternalLinkIcon,
    AnimatedSpinner,
    Alert,
    Check,
  },
  props: {
    resolve: { type: Function, required: true },
    close: { type: Function, default: null },
  },
  computed: {
    ...mapState(['address', 'wallet', 'transactions']),
    ...mapGetters(['activeNetwork']),
    filteredTransactions() {
      return this.transactions.filter((t) => !t.unfinished).reverse();
    },
  },
  methods: {
    ...mapMutations(['removeAllTransactions']),
    disconnectWallet() {
      this.resolve();
      this.$store.dispatch('disconnectWallet');
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.account-info-modal {
  :deep(.container) {
    max-height: 90vh;
    display: flex;
    overflow: hidden auto;
    flex-direction: column;

    .body {
      overflow: hidden auto;
      display: flex;
      flex-direction: column;
      margin-bottom: 8px;
    }
  }

  color: variables.$color-white;

  .box {
    max-width: 100%;
    width: 400px;
    margin: 16px;
    padding: 2px;
    background-color: variables.$color-black2;
    border-radius: 16px;
    text-align: left;

    @extend %face-sans-14-regular;

    .wallet {
      width: 100%;
      padding: 18px 14px;
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
      color: variables.$color-gray2;

      .title {
        @extend %face-sans-15-medium;

        color: variables.$color-white;
      }

      .change-button {
        background-color: variables.$color-red2;
        color: variables.$color-white;
        padding: 6px 12px;
        border-radius: 30px;

        @extend %face-sans-14-medium;

        &:hover {
          cursor: pointer;
          opacity: 0.8;
        }
      }
    }

    .content {
      background-color: variables.$color-black3;
      padding: 18px 14px;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;

      .links {
        width: 100%;
        display: inline-flex;
        align-items: center;
        color: variables.$color-gray2;

        .copy-address {
          margin-right: 16px;
        }

        a {
          display: flex;
          align-items: center;
          color: variables.$color-gray2;
          text-decoration: none;

          svg {
            margin-right: 6px;
            width: 16px;
          }
        }
      }

      .address {
        width: 100%;
        display: inline-flex;
        align-items: center;
        padding: 8px 0 12px;

        @extend %face-sans-18-medium;

        img {
          height: 16px;
          width: 16px;
          margin-right: 8px;
        }
      }
    }
  }

  .recent-transactions {
    display: flex;
    flex-direction: column;
    padding: 24px;
    background-color: variables.$color-black;
    overflow: hidden auto;
    text-align: left;

    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;

      .button-plain {
        color: variables.$color-blue;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .transaction {
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-decoration: none;
      color: variables.$color-blue;

      > span {
        max-width: 350px;
      }

      &:hover {
        text-decoration: underline;
      }

      svg {
        margin-left: 5px;
        width: 24px;
        height: 24px;
        color: variables.$color-green;

        &.error {
          color: variables.$color-red;
        }
      }
    }

    > span {
      text-align: left;

      @extend %face-sans-18-regular;
    }
  }
}
</style>

<template>
  <ModalDefault
    class="account-info-modal"
    title="Account"
    close
    @close="resolve"
  >
    <div class="box">
      <div class="wallet">
        <div>
          Connected with {{ wallet ? wallet.name : '' }}
        </div>
        <div
          class="change-button"
          @click.prevent="disconnectWallet"
        >
          Disconnect
        </div>
      </div>
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
          View in explorer
          <ExternalLinkIcon />
        </a>
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
    }
  }

  color: variables.$color-white;

  .box {
    max-width: 350px;
    margin: 0 16px 16px 16px;
    padding: 16px;
    border: 1px solid variables.$color-black;
    border-radius: 12px;
    text-align: left;

    @extend %face-sans-14-regular;

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
          margin-left: 6px;
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

    .wallet {
      width: 100%;
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
      color: variables.$color-gray2;

      .change-button {
        color: #2172e5;
        padding: 5px 10px;
        border: 1px solid variables.$color-black;
        border-radius: 12px;

        &:hover {
          cursor: pointer;
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

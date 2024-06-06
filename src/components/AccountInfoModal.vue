<template>
  <ModalDefault
    class="account-info-modal"
    :title="$t('accountInfoModal.title')"
    close
    @close="resolve"
  >
    <div class="box">
      <div class="header">
        <div class="title">
          <i18n-t keypath="accountInfoModal.connectWithWallet">
            <span>{{ wallet ? wallet.name : '' }}</span>
          </i18n-t>
        </div>
        <ButtonPlain
          class="change-button"
          data-cy="wallet-disconnect"
          @click.prevent="disconnectWallet"
        >
          <span class="h-xs">{{ $t('accountInfoModal.disconnect') }}</span>
          <LogoutIcon class="h-xl h-lg h-md h-sm" />
        </ButtonPlain>
      </div>
      <div class="content">
        <div class="address">
          <AddressAvatar :address="address" />
          <span>{{ `${address.slice(0, 6)}...${address.slice(-3)}` }}</span>
        </div>
        <div class="links">
          <ClipboardCopy
            class="copy-address"
            :title="$t('accountInfoModal.copyAddress')"
            :content="address"
          />
          <a
            v-if="activeNetwork"
            :href="`${activeNetwork.explorerUrl}/account/${address}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLinkIcon />
            {{ $t('viewExplorer') }}
          </a>
        </div>
      </div>
    </div>
    <div class="box">
      <div class="header">
        <div class="title">
          {{ $t('accountInfoModal.recentTransactions') }}
        </div>
        <ButtonPlain
          v-if="filteredTransactions.length"
          class="change-button"
          @click="removeAllTransactions"
        >
          <span class="h-xs">{{ $t('clearAll') }}</span>
          <DeleteIcon class="h-xl h-lg h-md h-sm" />
        </ButtonPlain>
      </div>
      <div class="content transactions">
        <template v-if="filteredTransactions.length">
          <a
            v-for="transaction in filteredTransactions"
            :key="transaction.hash"
            :href="`${activeNetwork.explorerUrl}/transactions/${transaction.hash}`"
            target="_blank"
            rel="noopener noreferrer"
            class="transaction"
          >
            <AnimatedSpinner v-if="transaction.pending" />
            <Alert v-else-if="transaction.error" class="error" />
            <Check v-else />
            <span>{{ transaction.info }}</span>
          </a>
        </template>
        <div v-else class="no-data">
          {{ $t('accountInfoModal.transactionsWillAppear') }}
        </div>
      </div>
    </div>
  </ModalDefault>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import ExternalLinkIcon from '@/assets/external-link.svg';
import LogoutIcon from '@/assets/logout.svg';
import DeleteIcon from '@/assets/delete.svg';
import AnimatedSpinner from '@/assets/animated-spinner.svg';
import Alert from '@/assets/alert.svg';
import Check from '@/assets/check.svg';
import AddressAvatar from '@/components/AddressAvatar.vue';
import ButtonPlain from './ButtonPlain.vue';
import ClipboardCopy from './ClipboardCopy.vue';
import ModalDefault from './ModalDefault.vue';

export default {
  components: {
    AddressAvatar,
    ModalDefault,
    ClipboardCopy,
    ButtonPlain,
    ExternalLinkIcon,
    LogoutIcon,
    DeleteIcon,
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
    flex: 1;
    margin: 16px;
    padding: 2px;
    background-color: variables.$color-black2;
    border-radius: 16px;
    text-align: left;

    @extend %face-sans-14-regular;

    .header {
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

        svg {
          width: 18px;
          height: 18px;
          margin-top: 3px;
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

      &.transactions {
        padding: 6px 0;
        max-height: 30vh;
        overflow-y: auto;

        .no-data {
          padding: 18px 14px;

          @extend %face-sans-14-regular;
        }

        .transaction {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: variables.$color-gray2;
          padding: 8px 14px;

          &:hover {
            background-color: variables.$color-black2;
          }

          svg {
            margin-right: 5px;
            width: 34px;
            height: 34px;
            color: variables.$color-green;

            &.error {
              color: variables.$color-red;
            }
          }
        }
      }
    }
  }
}
</style>

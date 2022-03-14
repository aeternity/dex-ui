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
          Conneced with {{ walletName }}
        </div>
        <div
          class="change-btn"
          @click.prevent="walletDisconnect()"
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
  </ModalDefault>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import ModalDefault from './ModalDefault.vue';
import ClipboardCopy from './ClipboardCopy.vue';
import ExternalLinkIcon from '../assets/external-link.svg?vue-component';

export default {
  components: {
    ModalDefault,
    ClipboardCopy,
    ExternalLinkIcon,
  },
  props: {
    resolve: { type: Function, required: true },
    close: { type: Function, default: null },
  },
  computed: {
    ...mapState(['address', 'walletName']),
    ...mapGetters(['activeNetwork']),
  },
  methods: {
    async walletDisconnect() {
      await this.$store.dispatch('disconnectWallet');
      window.location.reload();
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.account-info-modal {
  :deep(.container) {
    .body {
      margin-bottom: 40px;
    }
  }

  color: variables.$color-white;

  .box {
    max-width: 350px;
    margin: 16px;
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

      .change-btn {
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
}
</style>

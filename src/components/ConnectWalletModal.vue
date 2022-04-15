<template>
  <ModalDefault
    class="connect-wallet-modal"
    title="Connect a wallet"
    close
    @close="resolve"
  >
    <div
      v-if="UNFINISHED_FEATURES"
      class="box"
    >
      By connecting a wallet, you agree to DEX
      <a href="#">Terms of Service</a>  and acknowledge that you have read and understand
      the DEX <a href="#">Protocol Disclaimer</a>.
    </div>

    <div
      v-if="connecting"
      class="box loading"
    >
      <AnimatedSpinner />
      <span>Initializing...</span>
    </div>
    <div
      v-if="scanningForWallets"
      class="box loading"
    >
      <AnimatedSpinner />
      <span>Scanning for wallets...</span>
    </div>
    <template
      v-for="wallet of wallets"
      :key="wallet.id"
    >
      <div
        v-if="!connecting || wallet.id === connectingTo"
        class="box wallet"
        @click.prevent="onWalletConnect(wallet)"
      >
        <div class="info">
          <div class="title">
            {{ wallet.name }}
          </div>
          <div
            v-if="wallet.id === connectingTo"
            class="description"
          >
            {{ wallet.description }}
          </div>
        </div>
        <img
          v-if="icons[wallet.name]"
          :src="icons[wallet.name]"
          :alt="wallet.name"
        >
      </div>
    </template>
  </ModalDefault>
</template>

<script>
import {
  WalletDetector, BrowserWindowMessageConnection,
} from '@aeternity/aepp-sdk';
import { resolveWithTimeout } from '../lib/utils';
import ModalDefault from './ModalDefault.vue';
import AnimatedSpinner from '../assets/animated-spinner.svg?skip-optimize';

export default {
  components: {
    ModalDefault,
    AnimatedSpinner,
  },
  props: {
    resolve: { type: Function, required: true },
    close: { type: Function, default: null },
  },
  data() {
    return {
      connecting: false,
      connectingTo: null,
      scanningForWallets: false,
      icons: {
        // eslint-disable-next-line global-require
        Superhero: require('../assets/wallets/superhero.png'),
      },
      wallets: [],
      UNFINISHED_FEATURES: process.env.UNFINISHED_FEATURES,
    };
  },
  async mounted() {
    if (this.$isMobile) {
      this.addDefaultWallet();
    } else {
      this.scanningForWallets = true;
      const scannerConnection = await BrowserWindowMessageConnection({
        connectionInfo: { id: 'spy' },
      });

      const detector = await WalletDetector({ connection: scannerConnection });

      const walletScanningTimeout = setTimeout(() => {
        detector.stopScan();
        this.addDefaultWallet();
        this.scanningForWallets = false;
      }, 5000);

      detector.scan(async ({ wallets }) => {
        this.wallets = [
          ...Object.values(wallets).map((wallet) => ({
            ...wallet,
            description: 'Easy-to-use browser extension.',
          })),
        ];
        clearTimeout(walletScanningTimeout);
        detector.stopScan();
        this.scanningForWallets = false;
      });
    }
  },
  methods: {
    async onWalletConnect(wallet) {
      if (this.connecting) return;
      this.connecting = true;
      this.connectingTo = wallet.id;

      try {
        await resolveWithTimeout(5000, async () => {
          await this.$watchUntilTruly(() => this.$store.state.sdk);
        });
      } catch (error) {
        this.$store.dispatch('modals/open', {
          name: 'show-error',
          message: 'Connection to SDK has been timeout, please try again later.',
        });
        this.connecting = false;
        this.connectingTo = null;
        return;
      }

      await this.$store.dispatch('connectWallet', wallet);

      this.connecting = false;
      this.connectingTo = null;
      this.resolve();
    },
    addDefaultWallet() {
      this.wallets = [
        {
          id: 'wallet.superhero.com',
          name: 'Superhero',
          networkId: 'ae_uat',
          type: 'website',
          description: 'Easy-to-use wallet.',
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.connect-wallet-modal {
  :deep(.container) {
    max-width: 400px;
    padding: 0 16px;

    .body {
      margin-bottom: 40px;
    }

    .header {
      padding: 20px 4px;
    }
  }

  .box {
    width: 350px;
    margin: 16px auto;
    padding: 16px;
    border: 1px solid variables.$color-black;
    border-radius: 12px;
    text-align: left;
    background-color: variables.$color-black2;
    color: white;
    font-size: 14px;

    a {
      color: variables.$color-blue;
      text-decoration: none;
    }

    &.wallet {
      margin-bottom: 4px;
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;

      .info {
        display: block;

        .title {
          font-size: 16px;
          font-weight: bold;
        }

        .description {
          font-size: 14px;
        }
      }

      img {
        width: 40px;
      }

      &:hover {
        cursor: pointer;
        border-color: variables.$color-blue;
      }
    }

    &.loading {
      border-color: white;
      margin-bottom: 4px;
      padding: 4px 16px;
      font-weight: bold;
      display: inline-flex;
      align-items: center;

      svg {
        height: 40px;
      }
    }
  }
}
</style>

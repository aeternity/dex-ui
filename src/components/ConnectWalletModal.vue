<template>
  <ModalDefault
    class="connect-wallet-modal"
    title="Connect a wallet"
    close
    @close="resolve"
  >
    <div
      v-if="UNFINISHED_FEATURES"
      class="description"
    >
      By connecting a wallet, you acknowledge that you
      have read and understand the Superhero DEX's
      <ButtonPlain @click.prevent="showTerms = !showTerms">
        Terms and Conditions.
      </ButtonPlain>
    </div>

    <div
      v-if="showTerms"
      class="terms"
    >
      By connecting a wallet, you agree to Superhero Swap's Terms
      of Service and acknowledge that you have read and understand the Protocol Disclaimer.
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
        class="box"
      >
        <div class="wallet">
          <div class="info">
            <img
              v-if="icons[wallet.name]"
              :src="icons[wallet.name]"
              :alt="wallet.name"
            >
            <div class="title">
              {{ wallet.name }}
              {{ wallet.name.includes('Wallet') ? '' : ' Wallet' }}
            </div>
          </div>

          <ButtonDefault
            v-if="!connecting"
            class="connect-wallet"
            fill="primary"
            @click.prevent="onWalletConnect(wallet)"
          >
            <span>Connect Wallet</span>
          </ButtonDefault>
        </div>
        <div
          v-if="connecting || wallet.type === 'website'"
          class="wallet-extentions"
        >
          <div
            v-if="connecting"
            class="loading"
          >
            Initializing...
          </div>
          <div v-if="wallet.type === 'website'">
            <div class="title">
              Get the browser extension
            </div>
            <div class="extentions">
              <a
                href="https://addons.mozilla.org/en-US/firefox/addon/superhero-wallet/"
                target="_blank"
                class="extention"
              >
                <FirefoxLogo />
                <div class="description">
                  Install for Firefox Browser
                </div>
              </a>
              <a
                href="https://chrome.google.com/webstore/detail/superhero/mnhmmkepfddpifjkamaligfeemcbhdne"
                target="_blank"
                class="extention"
              >
                <ChromeLogo />
                <div class="description">
                  Install for Chrome Browser
                </div>
              </a>
            </div>
          </div>
        </div>
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
import ButtonDefault from './ButtonDefault.vue';
import ButtonPlain from './ButtonPlain.vue';
import AnimatedSpinner from '../assets/animated-spinner.svg?skip-optimize';
import ChromeLogo from '../assets/chrome-logo.svg?skip-optimize';
import FirefoxLogo from '../assets/firefox-logo.svg?skip-optimize';

export default {
  components: {
    ButtonDefault,
    ButtonPlain,
    ModalDefault,
    AnimatedSpinner,
    ChromeLogo,
    FirefoxLogo,
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
      showTerms: false,
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
          ...Object.values(wallets),
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
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.connect-wallet-modal {
  :deep(.container) {
    padding: 0 16px;

    .body {
      margin-bottom: 40px;
    }

    .header {
      padding: 20px 4px;
    }
  }

  .description {
    color: variables.$color-gray2;
    text-align: left;
    padding: 4px;

    @extend %face-sans-14-medium;

    .button-plain {
      color: variables.$color-primary;

      &:hover {
        color: variables.$color-primary-light;
      }
    }
  }

  .terms {
    background-color: variables.$color-primary-dark2;
    color: variables.$color-primary;
    text-align: left;
    padding: 8px 16px;
    border-radius: 16px;
    margin-top: 20px;
  }

  .box {
    width: 100%;
    margin: 16px auto;
    padding: 2px;
    border: 1px solid variables.$color-black;
    border-radius: 16px;
    text-align: left;
    background-color: variables.$color-black2;
    color: variables.$color-white;

    @extend %face-sans-16-medium;

    a {
      color: variables.$color-primary;
      text-decoration: none;

      &:hover {
        color: variables.$color-primary-light;
      }
    }

    .wallet {
      padding: 6px 14px;
      width: 100%;
      display: inline-flex;
      justify-content: space-between;
      align-items: center;

      .info {
        display: inline-flex;
        align-items: center;

        .title {
          padding-left: 12px;

          @extend %face-sans-18-medium;
        }
      }

      .connect-wallet {
        padding: 6px 12px;
        white-space: nowrap;
        border-radius: 30px;

        @extend %face-sans-14-medium;
      }

      img {
        width: 40px;
      }
    }

    .wallet-extentions {
      background-color: variables.$color-modal-bg;
      padding: 6px 14px;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;

      .title {
        padding: 12px 0;

        @extend %face-sans-16-medium;
      }

      .extentions {
        display: inline-flex;

        .extention {
          display: inline-flex;

          @extend %face-sans-13-medium;

          svg {
            width: 30px;
            margin-right: 8px;
          }
        }
      }

      .loading {
        text-align: center;
        padding: 24px;

        @extend %face-sans-16-medium;
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

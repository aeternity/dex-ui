<template>
  <ModalDefault
    class="connect-wallet-modal"
    :title="$t('connectWalletModal.title')"
    close
    @close="resolve"
  >
    <i18n-t
      v-if="UNFINISHED_FEATURES"
      class="description"
      keypath="connectWalletModal.disclaimer"
      tag="div"
    >
      <ButtonPlain @click.prevent="$store.dispatch('modals/open', { name: 'term-and-condition' })">
        {{ $t('connectWalletModal.termsOfService') }}
      </ButtonPlain>
    </i18n-t>

    <div v-if="scanningForWallets" class="box loading">
      <AnimatedSpinner />
      <span>{{ $t('connectWalletModal.scanningWallet') }}...</span>
    </div>
    <template v-for="wallet of wallets" :key="wallet.info.id">
      <div
        v-if="!connecting || wallet.info.id === connectingTo"
        class="box wallet"
        :data-cy="`connect-${wallet.info.name}`"
        @click.prevent="onWalletConnect(wallet)"
        @keydown.prevent="onWalletConnect(wallet)"
      >
        <div class="wallet">
          <div class="info">
            <img
              v-if="icons[wallet.info.name]"
              :src="icons[wallet.info.name]"
              :alt="wallet.info.name"
            />
            <div class="title">
              {{ wallet.info.name }}
              {{ wallet.info.name.includes('Wallet') ? '' : ' Wallet' }}
            </div>
          </div>

          <ButtonDefault
            v-if="!connecting"
            class="connect-wallet"
            fill="primary"
            @click.prevent="onWalletConnect(wallet)"
          >
            <span>{{ $t('connectWallet') }}</span>
          </ButtonDefault>
        </div>
        <div v-if="connecting || wallet.info.type === 'website'" class="wallet-extentions">
          <div v-if="connecting" class="loading">
            {{ $t('initializing') }}
          </div>
          <div v-if="wallet.info.type === 'website'">
            <div class="title">
              {{ $t('connectWalletModal.getTheBrowserExtension') }}
            </div>
            <div class="extentions">
              <a
                href="https://addons.mozilla.org/en-US/firefox/addon/superhero-wallet/"
                target="_blank"
                rel="noopener noreferrer"
                class="extention"
              >
                <FirefoxLogo />
                <div class="description">
                  {{ $t('connectWalletModal.installFirefox') }}
                </div>
              </a>
              <a
                href="https://chrome.google.com/webstore/detail/superhero/mnhmmkepfddpifjkamaligfeemcbhdne"
                target="_blank"
                rel="noopener noreferrer"
                class="extention"
              >
                <ChromeLogo />
                <div class="description">
                  {{ $t('connectWalletModal.installChrome') }}
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
import { walletDetector, BrowserWindowMessageConnection } from '@aeternity/aepp-sdk';
import AnimatedSpinner from '@/assets/animated-spinner.svg';
import ChromeLogo from '@/assets/chrome-logo.svg';
import FirefoxLogo from '@/assets/firefox-logo.svg';
import SuperheroLogo from '@/assets/wallets/superhero.png';
import { resolveWithTimeout } from '@/lib/utils';
import { IN_FRAME } from '@/lib/constants';
import ModalDefault from './ModalDefault.vue';
import ButtonDefault from './ButtonDefault.vue';
import ButtonPlain from './ButtonPlain.vue';

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
      icons: {
        // eslint-disable-next-line global-require
        Superhero: SuperheroLogo,
      },
      wallets: [],
      UNFINISHED_FEATURES: import.meta.env.UNFINISHED_FEATURES,
    };
  },
  async mounted() {
    if (this.$isMobile && !IN_FRAME) {
      this.addDefaultWallet();
    } else {
      this.scanningForWallets = true;
      const scannerConnection = new BrowserWindowMessageConnection({
        connectionInfo: { id: 'spy' },
      });

      let stopScan = null;

      const walletScanningTimeout = setTimeout(() => {
        stopScan?.();
        this.addDefaultWallet();
        this.scanningForWallets = false;
      }, 5000);

      const handleWallet = async ({ wallets }) => {
        this.wallets = [
          ...Object.values(wallets).map((wallet) => ({
            ...wallet,
            description: this.$t('connectWalletModal.superheroDesc'),
          })),
        ];
        clearTimeout(walletScanningTimeout);
        stopScan?.();
        this.scanningForWallets = false;
      };

      stopScan = walletDetector(scannerConnection, handleWallet);
    }
  },
  methods: {
    async onWalletConnect(walletObj) {
      if (this.connecting) return;
      this.connecting = true;
      this.connectingTo = walletObj.info.id;

      try {
        await resolveWithTimeout(5000, async () => {
          await this.$watchUntilTruly(() => this.$store.state.sdk);
        });
      } catch (error) {
        this.$store.dispatch('modals/open', {
          name: 'show-error',
          message: this.$t('connectWalletModal.onWalletConnectTimeout'),
        });
        this.connecting = false;
        this.connectingTo = null;
        return;
      }

      await this.$store.dispatch('connectWallet', walletObj);

      this.connecting = false;
      this.connectingTo = null;
      this.resolve();
    },
    addDefaultWallet() {
      this.wallets = [
        {
          // just a stub
          getConnection: null,
          info: {
            id: 'wallet.superhero.com',
            name: 'Superhero',
            networkId: this.$store.state.networkId || import.meta.env.VITE_DEFAULT_NETWORK,
            type: 'website',
            description: this.$t('connectWalletModal.easyUseWallet'),
          },
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

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
    <template
      v-for="wallet of wallets"
      :key="wallet.id"
    >
      <div
        v-if="!connecting || wallet.id === connectingTo"
        class="box wallet"
        @click.prevent="onWalletConnect(wallet.id)"
      >
        <div class="info">
          <div class="title">
            {{ wallet.title }}
          </div>
          <div
            v-if="wallet.id === connectingTo"
            class="description"
          >
            {{ wallet.description }}
          </div>
        </div>
        <img
          :src="wallet.icon"
          :alt="wallet.title"
        >
      </div>
    </template>
  </ModalDefault>
</template>

<script>
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
    includeWae: { type: Boolean, default: true },
  },
  data() {
    return {
      connecting: false,
      connectingTo: null,
      wallets: [
        {
          id: 'superhero',
          title: 'Superhero',
          description: 'Easy-to-use browser extension.',
          // eslint-disable-next-line global-require
          icon: require('../assets/wallets/superhero.png'),
        },
      ],
      UNFINISHED_FEATURES: process.env.UNFINISHED_FEATURES,
    };
  },
  methods: {
    async onWalletConnect(id) {
      this.connecting = true;
      this.connectingTo = id;
      if (id === 'superhero') {
        await this.$watchUntilTruly(() => this.$store.state.sdk);
        await this.$store.dispatch('connectWallet');
      }

      this.connecting = false;
      this.connectingTo = null;
      this.resolve();
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

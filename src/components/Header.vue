<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="header">
    <div class="left">
      <span>DEX</span>
      <img src="../assets/ae.svg">
    </div>
    <NavigationMenu />
    <div class="right">
      <ButtonDefault
        v-if="!address"
        :spinner="loading"
        :disabled="loading"
        class="connect-wallet"
        fill="transparent-blue"
        @click="connectWallet"
      >
        <span>Connect Wallet</span>
      </ButtonDefault>
      <div
        v-else
        class="account-info"
      >
        <span><AeBalance :address="address" /> AE</span>
        <div class="address">
          <span>{{ `${address.slice(0,6)}...${address.slice(-3)}` }}</span>
          <img :src="`https://avatars.z52da5wt.xyz/${address}`">
        </div>
      </div>
      <ActionsMenu @click.stop>
        <template #display>
          <div class="more">
            •••
          </div>
        </template>
        <a
          href="https://aeternity.com/"
          target="_blank"
        >
          About us
          <img src="../assets/ae.svg">
        </a>
      </ActionsMenu>
    </div>
    <iframe
      v-if="useIframeWallet && !address"
      :src="walletUrl"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ActionsMenu from './ActionsMenu.vue';
import AeBalance from './AeBalance.vue';
import NavigationMenu from './NavigationMenu.vue';
import ButtonDefault from './ButtonDefault.vue';

export default {
  components: {
    ActionsMenu,
    NavigationMenu,
    ButtonDefault,
    AeBalance,
  },
  data: () => ({
    walletUrl: process.env.VUE_APP_WALLET_URL,
    loading: false,
  }),
  computed: mapState(['address', 'useIframeWallet']),
  methods: {
    async connectWallet() {
      this.loading = true;
      await this.$watchUntilTruly(() => this.$store.state.sdk);
      await this.$store.dispatch('scanForWallets');
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/typography.scss';

.header {
  display: flex;
  align-items: center;

  iframe {
    display: none;
  }

  .left, .right {
    flex-grow: 1;
    flex-basis: 0;
    display: flex;
  }

  .left {
    justify-content: start;
    align-items: center;
    font-size: 24px;
    font-weight: 600;

    span {
      margin-right: 4px;
    }

    img {
      width: 24px;
      height: 24px;
    }
  }

  .right {
    justify-content: end;

    .account-info {
      display: flex;
      align-items: center;
      background-color: rgb(33, 36, 41);
      border-radius: 12px;
      margin-right: 10px;
      color: white;

      span {
        padding: 0 8px 0 12px;
        white-space: nowrap;
      }

      .address {
        display: flex;
        align-items: center;
        color: white;
        padding: 12px 10px;
        background-color: rgb(25, 27, 31);
        border-radius: 12px;
        border: 1px solid rgb(25, 27, 31);

        @extend %face-sans-16-regular;

        img {
          height: 16px;
          width: 16px;
        }
      }
    }

    .connect-wallet {
      padding: 8px;
      margin-right: 10px;
      white-space: nowrap;

      @extend %face-sans-16-regular;
    }

    .actions-menu {
      .more {
        color: white;
        padding: 10px 12px;
        cursor: pointer;
        border: 1px solid rgb(25, 27, 31);
        border-radius: 12px;
        background-color: rgb(25, 27, 31);

        &:hover {
          border-color: rgb(64, 68, 79);
        }
      }

      a {
        color: rgb(195, 197, 203);
        text-decoration: none;
        display: flex;
        justify-content: space-between;
        min-width: 200px;
        padding: 8px;

        &:hover {
          color: white;
        }

        img {
          height: 16px;
          width: 16px;
        }
      }
    }
  }

  @media (max-width: 480px) {
    .left span {
      display: none;
    }
  }

  @media (max-width: 400px) {
    .right .account-info span {
      display: none;
    }
  }

  @media (max-width: 1100px) {
    .navigation-menu {
      display: none;
    }
  }
}
</style>

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
        :spinner="connectingToWallet"
        :disabled="connectingToWallet"
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
      v-if="useIframeWallet"
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
  }),
  computed: mapState(['address', 'useIframeWallet', 'connectingToWallet']),
  methods: {
    async connectWallet() {
      await this.$watchUntilTruly(() => this.$store.state.sdk);
      await this.$store.dispatch('connectWallet');
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';
@use '../styles/mixins.scss';

.header {
  display: flex;
  align-items: center;

  iframe {
    display: none;
  }

  .left,
  .right {
    flex-grow: 1;
    flex-basis: 0;
    display: flex;
  }

  .left {
    justify-content: start;
    align-items: center;

    @extend %face-sans-24-bold;

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
      background-color: variables.$color-black2;
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
        background-color: variables.$color-black3;
        border-radius: 12px;
        border: 1px solid variables.$color-black3;

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
        border: 1px solid variables.$color-black3;
        border-radius: 12px;
        background-color: variables.$color-black3;

        &:hover {
          border-color: variables.$color-gray;
        }
      }

      a {
        color: variables.$color-white2;
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

  @include mixins.phone {
    .left span {
      display: none;
    }
  }

  @include mixins.sm-phone {
    .right .account-info span {
      display: none;
    }
  }

  @include mixins.laptop {
    .navigation-menu {
      display: none;
    }
  }
}
</style>

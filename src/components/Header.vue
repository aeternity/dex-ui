<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="header">
    <div class="left">
      <AeLogo />
    </div>
    <NavigationMenu />
    <div class="right">
      <div
        v-if="activeNetwork"
        class="active-network"
      >
        <span class="circle" />
        <span>{{ activeNetwork.name }}</span>
      </div>
      <ButtonDefault
        v-if="!address"
        :spinner="connectingToWallet"
        :disabled="connectingToWallet"
        class="connect-wallet"
        fill="primary"
        @click="connectWallet"
      >
        <span>Connect Wallet</span>
      </ButtonDefault>
      <div
        v-else
        class="account-info"
      >
        <span><AeBalance :address="address" /> AE</span>
        <div
          class="address"
          @click.prevent="openAccountInfo()"
        >
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
        <div v-if="activeMenu === 'main'">
          <a
            href="https://aeternity.com/"
            target="_blank"
          >
            About us
          </a>
          <a
            v-if="UNFINISHED_FEATURES"
            href="https://aeternity.com/"
            target="_blank"
          >
            Terms & Condition
          </a>
          <div
            v-if="UNFINISHED_FEATURES"
            class="link"
            @click.prevent="activeMenu = 'settings'"
          >
            Settings
            <Cog />
          </div>
          <a
            href="https://discord.com/invite/55f8F2jZq4"
            target="_blank"
          >
            Discord
          </a>
          <a
            href="https://github.com/aeternity/dex-contracts-v2/"
            target="_blank"
          >
            Contracts
          </a>
          <a
            href="https://github.com/aeternity/dex-ui/"
            target="_blank"
          >
            Source
          </a>
          <a
            href="https://github.com/aeternity/dex-ui/issues"
            target="_blank"
          >
            Report a bug
          </a>
        </div>

        <div v-if="activeMenu === 'settings'">
          <div
            class="link"
            @click.prevent="activeMenu = 'main'"
          >
            <BackArrow />
          </div>
          <div
            class="link"
            @click.prevent="activeMenu = 'languages'"
          >
            Languages
          </div>

          <div class="link">
            Light Theme
          </div>
        </div>

        <div v-if="activeMenu === 'languages'">
          <div
            class="link"
            @click.prevent="activeMenu = 'settings'"
          >
            <BackArrow />
          </div>

          <div class="link">
            English
          </div>

          <div class="link">
            French
          </div>
        </div>
      </ActionsMenu>
    </div>
    <iframe
      v-if="useIframeWallet"
      :src="walletUrl"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import AeLogo from '../assets/logo.svg?vue-component';
import BackArrow from '../assets/back.svg?vue-component';
import Cog from '../assets/cog.svg?vue-component';

import ActionsMenu from './ActionsMenu.vue';
import AeBalance from './AeBalance.vue';
import NavigationMenu from './NavigationMenu.vue';
import ButtonDefault from './ButtonDefault.vue';

export default {
  components: {
    AeLogo,
    BackArrow,
    Cog,
    ActionsMenu,
    NavigationMenu,
    ButtonDefault,
    AeBalance,
  },
  data: () => ({
    walletUrl: process.env.VUE_APP_WALLET_URL,
    activeMenu: 'main',
    UNFINISHED_FEATURES: process.env.UNFINISHED_FEATURES,
  }),
  computed: {
    ...mapState(['address', 'useIframeWallet', 'connectingToWallet']),
    ...mapGetters(['activeNetwork']),
  },
  methods: {
    async connectWallet() {
      this.$store.dispatch('modals/open', { name: 'connect-wallet' });
    },
    openAccountInfo() {
      this.$store.dispatch('modals/open', { name: 'account-info' });
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

    svg {
      height: 22px;
    }
  }

  .right {
    justify-content: flex-end;

    .active-network {
      display: flex;
      align-items: center;
      margin-right: 10px;
      padding: 0 16px;
      color: variables.$color-white;

      @extend %face-sans-15-normal;

      .circle {
        width: 6px;
        height: 6px;
        border-radius: 51%;
        margin-right: 5px;
        background-color: variables.$color-primary;
      }
    }

    .account-info {
      display: flex;
      align-items: center;
      background-color: variables.$color-black2;
      border-radius: 12px;
      margin-right: 10px;
      color: variables.$color-white;

      span {
        padding: 0 8px 0 12px;
        white-space: nowrap;
      }

      .address {
        display: flex;
        align-items: center;
        color: variables.$color-white;
        padding: 12px 10px;
        background-color: variables.$color-black3;
        border-radius: 12px;
        border: 1px solid variables.$color-black3;

        @extend %face-sans-16-regular;

        img {
          height: 16px;
          width: 16px;
        }

        &:hover {
          cursor: pointer;
        }
      }
    }

    .connect-wallet {
      padding: 0 16px;
      margin-right: 10px;
      white-space: nowrap;
      border-radius: 66px;

      @extend %face-sans-14-medium;
    }

    .actions-menu {
      .more {
        color: variables.$color-white;
        padding: 10px 12px;
        cursor: pointer;
        border: 1px solid variables.$color-black3;
        border-radius: 12px;
        background-color: variables.$color-black3;

        &:hover {
          border-color: variables.$color-gray;
        }
      }

      a,
      .link {
        color: variables.$color-white2;
        text-decoration: none;
        display: flex;
        justify-content: space-between;
        min-width: 200px;
        padding: 8px;

        &:hover {
          color: variables.$color-white;
        }

        svg {
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

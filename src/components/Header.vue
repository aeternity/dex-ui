<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="header">
    <div class="left">
      <span>DEX</span>
      <img src="../assets/ae.svg">
    </div>
    <NavigationMenu />
    <div class="right">
      <button
        v-if="address"
        :class="['connect-wallet', { disabled: loading }]"
        @click="addLiquidity"
      >
        <span v-if="!loading">Add liquidity</span>
        <img
          v-else
          src="../assets/animated-spinner.svg"
        >
      </button>
      <button
        v-if="!address"
        :class="['connect-wallet', { disabled: loading }]"
        @click="connectWallet"
      >
        <span v-if="!loading">Connect Wallet</span>
        <img
          v-else
          src="../assets/animated-spinner.svg"
        >
      </button>
      <div
        v-else
        class="account-info"
      >
        <span>{{ balance.toFixed(2) }} AE</span>
        <div class="address">
          <span>{{ `${address.slice(0,6)}...${address.slice(-3)}`}}</span>
          <img :src="`https://avatars.z52da5wt.xyz/${address}`">
        </div>
      </div>
      <ActionsMenu @click.stop>
        <template v-slot:display>
          <div class="more">
            •••
          </div>
        </template>
        <a href="https://aeternity.com/" target="_blank">
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
import BigNumber from 'bignumber.js';
import ActionsMenu from './ActionsMenu.vue';
import NavigationMenu from './NavigationMenu.vue';

export default {
  components: {
    ActionsMenu,
    NavigationMenu,
  },
  data: () => ({
    walletUrl: process.env.VUE_APP_WALLET_URL,
    balance: 0,
    loading: false,
  }),
  computed: mapState(['address', 'useIframeWallet']),
  methods: {
    async connectWallet() {
      if (this.loading) return;
      this.loading = true;
      await this.$watchUntilTruly(() => this.$store.state.sdk);
      await this.$store.dispatch('scanForWallets');
      this.loading = false;
    },
    async addLiquidity() {
      const obj = {
        tokenA: 'ct_X5ZXB4U3g9ikrobouRiP2sMprtp152EeMtYdBmeyS5D4NhEfs',
        tokenB: 'ct_jTPt5W5w2HVYeDvBNe7CRjqD1dvRZf4E1PFsdQboHDKVpXD5y',
        amountADesired: 1n,
        amountBDesired: 1n,
      };
      await this.$store.dispatch('aeternity/createAllowance', {
        token: obj.tokenA,
        amount: 2n,
      });
      await this.$store.dispatch('aeternity/createAllowance', {
        token: obj.tokenB,
        amount: 2n,
      });
      await this.$store.dispatch('aeternity/addLiquidity', obj);
    },
  },
  watch: {
    address: {
      async handler(value) {
        let polling = null;
        if (value) {
          polling = setInterval(async () => {
            this.balance = new BigNumber(
              await this.$store.state.sdk.getBalance(value),
            ).shiftedBy(-18);
          }, 5000);
        }
        if (!value && polling) clearInterval(polling);
      },
      immediate: true,
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
      border-radius: 12px;
      border: 1px solid rgba(21, 61, 111, 0.44);
      color: rgb(80, 144, 234);
      background-color: rgba(21, 61, 111, 0.44);
      cursor: pointer;
      white-space: nowrap;

      &:active {
        box-shadow: rgb(55 107 173 / 44%) 0px 0px 0px 1pt;
      }

      &:hover {
        border: 1px solid rgba(49, 95, 154, 0.44);
        color: rgb(57, 130, 231);
      }

      img {
        height: 20px;
      }

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

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="header">
    <div class="left">
      <AeLogo class="h-xs" />
      <AeLogoSmall class="h-xl h-lg h-md h-sm" />
    </div>
    <NavigationMenu />
    <div class="right">
      <div v-if="activeNetwork && address" class="active-network">
        <span class="circle" />
        <span>{{ activeNetwork.name }}</span>
      </div>
      <ButtonDefault
        v-if="!address"
        :spinner="connectingToWallet"
        :disabled="connectingToWallet"
        class="connect-wallet"
        fill="primary"
        data-cy="connect-wallet"
        @click="connectWallet"
      >
        <span>{{ $t('connectWallet') }}</span>
      </ButtonDefault>
      <div v-else class="account-info">
        <div
          :class="['address', { pending: pendingTransactions.length }]"
          data-cy="wallet-address"
          @click.prevent="openAccountInfo()"
          @keydown.prevent="openAccountInfo()"
        >
          <template v-if="pendingTransactions.length">
            <span>{{ `${pendingTransactions.length} ${$t('pending')}` }}</span>
            <AnimatedSpinner />
          </template>
          <template v-else>
            <AddressAvatar :address="address" />
            <span class="h-xs">{{ `${address.slice(0, 6)}...${address.slice(-3)}` }}</span>
          </template>
        </div>
        <span><AeBalance :address="address" /> AE</span>
      </div>
      <ActionsMenu @click.stop>
        <template #display>
          <div class="more">•••</div>
        </template>
        <div v-if="activeMenu === 'main'">
          <a href="https://aeternity.com/" target="_blank" rel="noopener noreferrer">
            {{ $t('nav.aboutUs') }}
          </a>
          <ButtonPlain
            class="link"
            @click="$store.dispatch('modals/open', { name: 'term-and-condition' })"
          >
            {{ $t('nav.termsCondition') }}
          </ButtonPlain>
          <ButtonPlain class="link" @click="$store.dispatch('modals/open', { name: 'about-dex' })">
            {{ $t('nav.aboutDex') }}
          </ButtonPlain>
          <ButtonPlain class="link" @click="activeMenu = 'settings'">
            {{ $t('nav.settings.title') }}
          </ButtonPlain>
          <a href="https://discord.com/invite/55f8F2jZq4" target="_blank" rel="noopener noreferrer">
            {{ $t('nav.discord') }}
          </a>
          <a
            href="https://github.com/aeternity/dex-contracts-v2/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('nav.contracts') }}
          </a>
          <a href="https://github.com/aeternity/dex-ui/" target="_blank" rel="noopener noreferrer">
            {{ $t('nav.source') }}
          </a>
          <a
            href="https://github.com/aeternity/dex-ui/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('nav.reportBug') }}
          </a>
          <a
            href="https://form.jotform.com/221174404956355"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('nav.leaveFeedback') }}
          </a>
        </div>

        <div v-if="activeMenu === 'settings'">
          <ButtonPlain class="link" @click="activeMenu = 'main'">
            <BackArrow />
          </ButtonPlain>
          <ButtonPlain class="link" @click="activeMenu = 'languages'">
            {{ $t('nav.settings.languages') }}
          </ButtonPlain>

          <ButtonPlain v-if="UNFINISHED_FEATURES" class="link">
            {{ $t('nav.settings.theme') }}
          </ButtonPlain>
        </div>

        <div v-if="activeMenu === 'languages'">
          <ButtonPlain class="link" @click="activeMenu = 'settings'">
            <BackArrow />
          </ButtonPlain>

          <ButtonPlain class="link" @click="setLocale('en')"> English </ButtonPlain>

          <ButtonPlain class="link" @click="setLocale('fr')"> French </ButtonPlain>

          <ButtonPlain class="link" @click="setLocale('zh-cn')"> 简体中文 </ButtonPlain>
          <ButtonPlain class="link" @click="setLocale('ru')"> Русский </ButtonPlain>
        </div>
      </ActionsMenu>
    </div>
    <iframe v-if="useIframeWallet" :src="walletUrl" title="" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import AeLogo from '@/assets/logo.svg';
import AeLogoSmall from '@/assets/logo-small.svg';
import BackArrow from '@/assets/back.svg';
import AnimatedSpinner from '@/assets/animated-spinner.svg';
import AddressAvatar from '@/components/AddressAvatar.vue';
import ActionsMenu from './ActionsMenu.vue';
import AeBalance from './AeBalance.vue';
import NavigationMenu from './NavigationMenu.vue';
import ButtonDefault from './ButtonDefault.vue';
import ButtonPlain from './ButtonPlain.vue';

export default {
  components: {
    AddressAvatar,
    AeLogo,
    AeLogoSmall,
    BackArrow,
    AnimatedSpinner,
    ActionsMenu,
    NavigationMenu,
    ButtonDefault,
    ButtonPlain,
    AeBalance,
  },
  data: () => ({
    walletUrl: import.meta.env.VITE_WALLET_URL,
    activeMenu: 'main',
    UNFINISHED_FEATURES: import.meta.env.UNFINISHED_FEATURES,
  }),
  computed: {
    ...mapState(['address', 'useIframeWallet', 'connectingToWallet']),
    ...mapGetters(['activeNetwork']),
    ...mapState({
      pendingTransactions({ transactions }) {
        return transactions.filter((t) => t.pending && !t.unfinished);
      },
    }),
  },
  methods: {
    async connectWallet() {
      this.$store.dispatch('modals/open', { name: 'connect-wallet' });
    },
    openAccountInfo() {
      this.$store.dispatch('modals/open', { name: 'account-info' });
    },
    setLocale(locale) {
      this.$i18n.locale = locale;
      this.$store.commit('setLang', locale);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';
@use '../styles/mixins.scss';
@use '../styles/display-utilities.scss';

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
      background-color: variables.$color-black3;
      padding: 4px;
      border-radius: 16px;
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
        padding: 8px 10px;
        background-color: variables.$color-black2;
        border: 2px solid variables.$color-black2;
        border-radius: 12px;

        @extend %face-sans-15-medium;

        &.pending {
          background-color: variables.$color-blue;
          font-weight: 500;
        }

        img,
        svg {
          height: 16px;
          width: 16px;
        }

        &:hover {
          cursor: pointer;
          border-color: variables.$color-gray-hover;
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
        border: 2px solid variables.$color-black3;
        border-radius: 12px;
        background-color: variables.$color-black3;

        &:hover {
          border-color: variables.$color-gray-hover;
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

        @extend %face-sans-16-regular;

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

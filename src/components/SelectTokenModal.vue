<template>
  <ModalDefault
    class="select-token-modal"
    title="Select Token"
    close
    @close="resolve"
  >
    <div class="input-wrapper">
      <InputField
        v-model:value="searchTerm"
        placeholder="Search name or paste address"
        class="search-bar"
      />
    </div>
    <div class="token-list">
      <ButtonPlain
        v-for="token in filteredResults"
        :key="token.contract_id"
        class="toke-list-item"
        @click="resolve(token)"
      >
        <img :src="`https://avatars.z52da5wt.xyz/${token.contract_id}`">
        <div class="token">
          <span class="symbol">{{ token.symbol }}</span>
          <span class="name">{{ token.name }}</span>
        </div>
      </ButtonPlain>
      <div
        v-if="searchTerm && !filteredResults.length"
        class="empty"
      >
        No results found.
      </div>
    </div>
  </ModalDefault>
</template>

<script>
import { mapState } from 'vuex';
import ModalDefault from './ModalDefault.vue';
import InputField from './InputField.vue';
import ButtonPlain from './ButtonPlain.vue';

export default {
  components: {
    ModalDefault,
    InputField,
    ButtonPlain,
  },
  props: {
    resolve: { type: Function, required: true },
    close: { type: Function, default: null },
  },
  data: () => ({
    tokenList: [],
    searchTerm: '',
  }),
  computed: {
    ...mapState(['networkId']),
    filteredResults() {
      const searchTerm = this.searchTerm.trim().toLowerCase();
      return this.tokenList
        .filter(
          (token) => !searchTerm
            || token.symbol.toLowerCase().includes(searchTerm)
            || token.name.toLowerCase().includes(searchTerm)
            || token.contract_id.toLowerCase().includes(searchTerm),
        );
    },
  },
  async mounted() {
    // const middleware = {
    //   ae_mainnet: 'mainnet',
    //   ae_uat: 'testnet',
    // }[this.networkId];
    this.tokenList = [];

    const fstTkn = {
      contract_id: 'ct_KPfzobzyoPZjADKMWxDTbeZYfE9kSPpoJDbC6MkMztKtXJHRx',
      decimals: 18,
      name: 'First',
      symbol: 'FST',
    };
    const sndTkn = {
      contract_id: 'ct_upFEPXmz17bW9MfNoxFjFvhFBRXJK17rzHeVR5AGEDDxudAZU',
      decimals: 18,
      name: 'Second',
      symbol: 'SND',
    };
    const waePartnetTkn = {
      contract_id: 'ct_7bsapRtBe8eQVpgGh8kywE7mWcVAGCmFfN7GBFFByGL13e8tL',
      decimals: 18,
      name: 'Third',
      symbol: 'AE Partner',
    };
    const waeTkn = {
      contract_id: process.env.VUE_APP_WAE_ADDRESS,
      decimals: 18,
      name: 'AE',
      symbol: 'AE',
    };
    // not waiting for the remote list
    this.tokenList = [fstTkn, sndTkn, waePartnetTkn, waeTkn,
      // ...await fetchJson(
      //   `https://${middleware}.aeternity.io/mdw/aex9/by_name`,
      // ).catch(() => []),
    ];
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.select-token-modal {
  :deep(.container) {
    min-height: 60vh;

    .body {
      margin-bottom: 40px;
    }
  }

  .input-wrapper {
    margin: 0 20px 20px 20px;

    .search-bar {
      font-size: 18px;
      text-align: left;
      padding: 16px;
      border-radius: 20px;
      color: white;
      border: 1px solid variables.$color-gray;
      transition: border 100ms ease 0s;

      &:focus {
        border: 1px solid variables.$color-blue;
      }
    }
  }

  .token-list {
    display: flex;
    flex-direction: column;
    max-height: 50vh;
    overflow-y: auto;
    border-top: 1px solid variables.$color-black;

    .toke-list-item {
      display: flex;
      align-items: center;
      padding: 4px 20px;

      &:hover {
        background-color: variables.$color-black;
      }

      img {
        width: 24px;
        height: 24px;
        margin-right: 16px;
      }

      .token {
        display: flex;
        flex-direction: column;
        text-align: left;

        .symbol {
          color: white;
          font-weight: 500;
        }

        .name {
          color: variables.$color-gray2;
          font-size: 12px;
        }
      }
    }

    .empty {
      padding: 20px 0;
      color: variables.$color-gray2;
    }
  }
}
</style>

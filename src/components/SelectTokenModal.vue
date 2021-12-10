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
import ModalDefault from './ModalDefault.vue';
import InputField from './InputField.vue';
import ButtonPlain from './ButtonPlain.vue';
import { fetchJson } from '../lib/utils';

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
    this.tokenList = await fetchJson(
      'https://mainnet.aeternity.io/mdw/aex9/by_name',
    ).catch(() => {});
  },
};
</script>

<style lang="scss" scoped>
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
      border: 1px solid rgb(64, 68, 79);
      transition: border 100ms ease 0s;

      &:focus {
        border: 1px solid rgb(33, 114, 229);
      }
    }
  }

  .token-list {
    display: flex;
    flex-direction: column;
    max-height: 50vh;
    overflow-y: auto;
    border-top: 1px solid rgb(44, 47, 54);

    .toke-list-item {
      display: flex;
      align-items: center;
      padding: 4px 20px;

      &:hover {
        background-color: rgb(44, 47, 54);
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
          color: white;
          color: rgb(143, 150, 172);
          font-size: 12px;
        }
      }
    }

    .empty {
      padding: 20px 0;
      color: rgb(143, 150, 172);
    }
  }
}
</style>

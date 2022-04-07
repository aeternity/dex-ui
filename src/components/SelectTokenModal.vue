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
        :key="`${token.contract_id}|${token.symbol}`"
        :disabled="chosenTokens?.[0] && (chosenTokens[0]?.contract_id === token.contract_id
          && chosenTokens[0]?.symbol === token.symbol)"
        class="toke-list-item"
        :class="{ selected: (chosenTokens?.[0] || chosenTokens?.[1]) && !!chosenTokens.find(
          (t) => token.symbol === t?.symbol && token.contract_id === t?.contract_id,
        )}"
        @click="resolve(token)"
      >
        <img :src="token.image ?? `https://avatars.z52da5wt.xyz/${token.contract_id}`">
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
import { mapState, mapGetters } from 'vuex';
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
    aeVsWae: { type: Boolean },
    excludeWae: { type: Boolean },
    chosenTokens: { type: Array, default: null },
  },
  data: () => ({
    searchTerm: '',
  }),
  computed: {
    ...mapState(['networkId']),
    ...mapGetters(['activeNetwork', 'WAE']),
    tokenList() {
      return (this.activeNetwork && this.activeNetwork.tokens) ? this.activeNetwork.tokens : [];
    },
    filteredResults() {
      const searchTerm = this.searchTerm.trim().toLowerCase();
      return this.tokenList
        .filter(
          (token) => (!searchTerm
            || token.symbol.toLowerCase().includes(searchTerm)
            || token.name.toLowerCase().includes(searchTerm)
            || token.contract_id.toLowerCase().includes(searchTerm)
          ) && ((!(
            ((this.chosenTokens?.[0] || this.chosenTokens?.[1])
              && this.chosenTokens.find((t) => t?.symbol === 'AE' && t.contract_id === this.WAE)
              && token.symbol === 'WAE' && token.contract_id === this.WAE)
            || ((this.chosenTokens?.[0] || this.chosenTokens?.[1])
                && this.chosenTokens.find((t) => t?.symbol === 'WAE' && t.contract_id === this.WAE)
                && token.symbol === 'AE' && token.contract_id === this.WAE)
          ) || !this.aeVsWae)
          && (token.symbol !== 'WAE' || !this.excludeWae)),
        );
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.select-token-modal {
  :deep(.container) {
    min-height: 60vh;

    @media (min-width: 500px) {
      width: 400px;
    }

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

      &.selected {
        opacity: 0.5;
      }

      &:disabled {
        pointer-events: none;
      }

      &:hover {
        background-color: variables.$color-black;
      }

      img {
        width: 32px;
        height: 32px;
        border-radius: 24px;
        margin-right: 16px;
      }

      .token {
        display: flex;
        flex-direction: column;
        text-align: left;

        @extend %face-sans-18-regular;

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

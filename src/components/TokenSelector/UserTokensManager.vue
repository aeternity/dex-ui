<template>
  <div class="manage-tokens">
    <div class="input-wrapper">
      <InputField
        v-model:value="searchTerm"
        placeholder="Search name or paste address"
        class="search-bar"
      />
    </div>

    <div class="token-list-wrapper">
      <ListTokens
        v-if="!userTokens.length && extraTokens.length"
        class="custom-list"
        :tokens="extraTokens"
        :import-token="true"
        @token:import="selectTokenForImport"
      />

      <div class="filters">
        {{ userTokens.length }} Custom Tokens
        <div
          v-if="userTokens.length"
          class="clear-all"
          @click.prevent="onRemoveAllTokens()"
        >
          Clear all
        </div>
      </div>

      <div
        v-for="token in tokens"
        :key="token.contract_id"
        class="token"
      >
        <div class="wrapper">
          <div class="row">
            <img
              :src="`https://avatars.z52da5wt.xyz/${token.contract_id}`"
            >
            <div class="info">
              <span class="symbol">
                {{ token.symbol }}
              </span>
              <span class="name">
                {{ token.name }}
              </span>
            </div>
          </div>
          <div class="actions">
            <div
              class="delete"
              @click.prevent="onRemoveToken(token)"
            >
              <DeleteIcon />
            </div>
            <a
              v-if="activeNetwork"
              :href="`${activeNetwork.explorerUrl}/contracts/${token.contract_id}`"
              target="_blank"
            >
              <ExternalLinkIcon />
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="token-list-footer">
      Tip: Custom tokens are stored locally in your browser
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import ListTokens from './ListTokens.vue';
import InputField from '../InputField.vue';
import DeleteIcon from '../../assets/delete.svg?vue-component';
import ExternalLinkIcon from '../../assets/external-link.svg?vue-component';

export default {
  components: {
    ListTokens,
    InputField,
    DeleteIcon,
    ExternalLinkIcon,
  },
  emits: ['token:import'],
  data: () => ({
    searchTerm: '',
    extraTokens: [],
  }),
  computed: {
    ...mapState('tokens', ['userTokens']),
    ...mapGetters(['activeNetwork']),
    tokens() {
      const searchTerm = this.searchTerm.trim().toLowerCase();
      return this.userTokens.filter((token) => (!searchTerm
        || token.symbol.toLowerCase().includes(searchTerm)
        || token.name.toLowerCase().includes(searchTerm)
        || token.contract_id.toLowerCase().includes(searchTerm)
      ));
    },
  },
  watch: {
    async tokens(tokens) {
      /**
       * Load AEX9 contract token info if found
       */
      if (!tokens.length && this.searchTerm && this.searchTerm.includes('ct_')) {
        this.loadingExtraTokens = true;
        const token = await this.$store.dispatch('aeternity/getTokenInstanceMetaInfo', this.searchTerm);

        this.extraTokens = [
          {
            ...token.decodedResult,
            decimals: 18,
            contract_id: this.searchTerm,
          },
        ];
        this.loadingExtraTokens = false;
      }
    },
  },
  methods: {
    onRemoveToken(token) {
      this.$store.commit('tokens/removeToken', token);
    },
    onRemoveAllTokens() {
      this.$store.commit('tokens/removeAllTokens');
    },
    selectTokenForImport(token) {
      this.$emit('token:import', token);
    },
  },

};
</script>

<style lang="scss" scoped>

@use '../../styles/variables.scss';
@use '../../styles/typography.scss';
@use './style.scss';

.manage-tokens {
  width: 100%;

  .token-list-wrapper {
    display: flex;
    flex-direction: column;
    max-height: 50vh;
    min-height: 40vh;
    overflow-y: auto;
    color: variables.$color-white;

    .filters {
      border-top: 1px solid variables.$color-gray;
      display: flex;
      justify-content: space-between;
      padding: 15px 20px;

      @extend %face-sans-16-medium;

      .clear-all {
        color: variables.$color-blue;

        &:hover {
          cursor: pointer;
        }
      }
    }
  }

  .token-list-footer {
    border-top: 1px solid variables.$color-gray;
    color: variables.$color-gray2;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>

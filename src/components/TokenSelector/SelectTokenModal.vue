<template>
  <ModalDefault
    class="select-token-modal"
    :title="modalTitle"
    close
    @close="resolve"
  >
    <div v-if="tab === 'list-tokens'">
      <div class="input-wrapper">
        <InputField
          v-model:value="searchTerm"
          placeholder="Search name or paste address"
          class="search-bar"
        />
      </div>

      <div class="token-list">
        <ListTokens
          :tokens="filteredActiveProvidersTokens"
          @token:click="resolve"
        />
        <ListTokens
          v-if="filteredActiveProvidersTokens.length <= 1 && filteredInActiveProvidersTokens.length"
          :tokens="filteredInActiveProvidersTokens"
          :expanded-list="true"
          :import-token="true"
          @token:import="selectTokenForImport"
        />
        <ListTokens
          v-if="!filteredActiveProvidersTokens.length && !filteredInActiveProvidersTokens.length"
          :tokens="extraTokens"
          :import-token="true"
          @token:import="selectTokenForImport"
        />

        <div
          v-if="loadingExtraTokens"
          class="loading"
        >
          <AnimatedSpinner />
        </div>
        <div
          v-else-if="!filteredActiveProvidersTokens.length &&
            !filteredInActiveProvidersTokens.length &&
            !extraTokens.length"
          class="empty"
        >
          No results found.
        </div>
      </div>

      <div
        class="manage-token-list"
        @click.prevent="tab = 'manage-token-list'"
      >
        <EditIcon />
        Manage Token Lists
      </div>
    </div>

    <UserTokensAndListsManager
      v-if="tab === 'manage-token-list'"
      @token:import="selectTokenForImport"
    />
    <TokenImportCard
      v-if="tab === 'import-token'"
      :token="selectedToken"
      @token:import="importToken"
    />
    <template
      v-if="tab === 'manage-token-list' || tab === 'import-token'"
      #header-left
    >
      <div
        class="back-btn"
        @click.prevent="tab = 'list-tokens'"
      >
        <BackIcon />
      </div>
    </template>
  </ModalDefault>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import ModalDefault from '../ModalDefault.vue';
import UserTokensAndListsManager from './UserTokensAndListsManager.vue';
import InputField from '../InputField.vue';
import ListTokens from './ListTokens.vue';
import TokenImportCard from './TokenImportCard.vue';
import EditIcon from '../../assets/edit.svg?vue-component';
import BackIcon from '../../assets/back.svg?vue-component';
import AnimatedSpinner from '../../assets/animated-spinner.svg?vue-component';

export default {
  components: {
    ListTokens,
    UserTokensAndListsManager,
    TokenImportCard,
    ModalDefault,
    InputField,
    EditIcon,
    BackIcon,
    AnimatedSpinner,
  },
  props: {
    resolve: { type: Function, required: true },
    close: { type: Function, default: null },
    includeWae: { type: Boolean, default: true },
  },
  data: () => ({
    selectedToken: null,
    searchTerm: '',

    loadingExtraTokens: false,
    extraTokens: [],
    // tab: 'manage-token-list',
    tab: 'list-tokens',
    WAE: process.env.VUE_APP_WAE_ADDRESS,
  }),
  computed: {
    ...mapState('tokens', ['providers', 'userTokens']),
    ...mapGetters(['activeNetwork']),
    filteredActiveProvidersTokens() {
      const searchTerm = this.searchTerm.trim().toLowerCase();

      const tokens = [];
      this.providers
        .filter((provider) => provider.active)
        .forEach((provider) => {
          tokens.push(...provider.tokens);
        });
      tokens.push(...this.userTokens);

      return tokens.filter((token) => (!searchTerm
        || token.symbol.toLowerCase().includes(searchTerm)
        || token.name.toLowerCase().includes(searchTerm)
        || token.contract_id.toLowerCase().includes(searchTerm)
      ) && (token.symbol !== 'WAE' || this.includeWae));
    },
    filteredInActiveProvidersTokens() {
      const searchTerm = this.searchTerm.trim().toLowerCase();

      const tokens = [];
      this.providers
        .filter((provider) => !provider.active)
        .forEach((provider) => {
          tokens.push(...provider.tokens);
        });

      return tokens.filter((token) => (!searchTerm
        || token.symbol.toLowerCase().includes(searchTerm)
        || token.name.toLowerCase().includes(searchTerm)
        || token.contract_id.toLowerCase().includes(searchTerm)
      ));
    },
    modalTitle() {
      if (this.tab === 'manage-token-list') {
        return 'Manage';
      }
      if (this.tab === 'import-token') {
        return 'Import token';
      }
      return 'Select Token';
    },
  },
  watch: {
    async filteredActiveProvidersTokens(tokens) {
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
  async mounted() {
    await this.$store.dispatch('tokens/fetchAllTokens');
  },
  methods: {
    selectTokenForImport(token) {
      this.selectedToken = token;
      this.tab = 'import-token';
    },
    async importToken() {
      this.$store.commit('tokens/addToken', {
        ...this.selectedToken,
        custom: true,
      });
      await this.resolve(this.selectedToken);
      this.selectedToken = null;
      this.tab = 'list-tokens';
    },

  },
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables.scss';
@use '../../styles/typography.scss';
@use './style.scss';

.select-token-modal {
  :deep(.container) {
    min-height: 60vh;
    width: 420px;
  }

  .input-wrapper {
    margin: 0 20px 20px 20px;
  }

  .token-list {
    display: flex;
    flex-direction: column;
    max-height: 50vh;
    min-height: 40vh;
    overflow-y: auto;
    border-top: 1px solid variables.$color-black;
    padding: 10px 0;
  }

  .manage-token-list {
    background-color: variables.$color-black;
    border-top: 1px solid variables.$color-gray;
    color: variables.$color-blue;
    padding: 20px 0;
    display: flex;
    align-items: center;
    justify-content: center;

    @extend %face-sans-14-medium;

    &:hover {
      cursor: pointer;
    }

    svg {
      width: 14px;
      margin-right: 6px;
    }
  }

  .back-btn {
    &:hover {
      cursor: pointer;
    }

    svg {
      width: 18px;
    }
  }

  .loading {
    svg {
      width: 50%;
    }
  }
}
</style>

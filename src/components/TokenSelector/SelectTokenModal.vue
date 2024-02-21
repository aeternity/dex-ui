<template>
  <ModalDefault class="select-token-modal" :title="modalTitle" close @close="resolve">
    <div v-if="tab === 'list-tokens'" class="token-list-container">
      <div class="input-wrapper">
        <InputField
          v-model:value="searchTerm"
          :placeholder="$t('searchTokenInput')"
          class="search-bar"
        />
      </div>

      <div class="token-list">
        <ListTokens
          :tokens="filteredActiveProvidersTokens"
          :chosen-tokens="chosenTokens"
          @token:click="resolve"
        />
        <ListTokens
          v-if="filteredActiveProvidersTokens.length <= 1 && filteredInActiveProvidersTokens.length"
          :tokens="filteredInActiveProvidersTokens"
          expanded-list
          import-token
          @token:import="selectTokenForImport"
        />
        <ListTokens
          v-if="!filteredActiveProvidersTokens.length && !filteredInActiveProvidersTokens.length"
          :tokens="extraTokens"
          import-token
          @token:import="selectTokenForImport"
        />

        <AnimatedSpinner v-if="loadingExtraTokens" class="loading" />

        <div
          v-else-if="
            !filteredActiveProvidersTokens.length &&
            !filteredInActiveProvidersTokens.length &&
            !extraTokens.length
          "
          class="empty"
        >
          {{ $t('tokenSelector.notFound') }}.
        </div>
      </div>

      <div
        class="manage-token-list"
        @click.prevent="tab = 'manage-token-list'"
        @keydown.prevent="tab = 'manage-token-list'"
      >
        <EditIcon />
        {{ $t('tokenSelector.manageTokens') }}
      </div>
    </div>

    <UserTokensAndListManager
      v-if="tab === 'manage-token-list'"
      @token:import="selectTokenForImport"
    />
    <TokenImportCard
      v-if="tab === 'import-token'"
      :token="selectedToken"
      @token:import="importToken"
    />
    <template v-if="tab === 'manage-token-list' || tab === 'import-token'" #header-left>
      <ButtonPlain class="back-button" @click.prevent="tab = 'list-tokens'">
        <BackIcon />
      </ButtonPlain>
    </template>
  </ModalDefault>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import EditIcon from '@/assets/edit.svg';
import BackIcon from '@/assets/back.svg';
import AnimatedSpinner from '@/assets/animated-spinner.svg';
import ModalDefault from '../ModalDefault.vue';
import UserTokensAndListManager from './UserTokensAndListManager.vue';
import InputField from '../InputField.vue';
import ButtonPlain from '../ButtonPlain.vue';
import ListTokens from './ListTokens.vue';
import TokenImportCard from './TokenImportCard.vue';

export default {
  components: {
    ListTokens,
    UserTokensAndListManager,
    TokenImportCard,
    ModalDefault,
    InputField,
    ButtonPlain,
    EditIcon,
    BackIcon,
    AnimatedSpinner,
  },
  props: {
    resolve: { type: Function, required: true },
    aeVsWae: { type: Boolean },
    excludeWae: { type: Boolean },
    chosenTokens: { type: Array, default: null },
  },
  data: () => ({
    selectedToken: null,
    searchTerm: '',
    loadingExtraTokens: false,
    extraTokens: [],
    tab: 'list-tokens',
  }),
  computed: {
    ...mapState(['networkId']),
    ...mapGetters('tokens', ['getAvailableTokens']),
    ...mapGetters(['activeNetwork', 'WAE']),
    filteredActiveProvidersTokens() {
      const searchTerm = this.searchTerm.trim().toLowerCase();

      return this.getAvailableTokens()
        .filter((token) => token.networkId === this.networkId)
        .filter(
          (token) =>
            (!searchTerm ||
              token.symbol.toLowerCase().includes(searchTerm) ||
              token.name.toLowerCase().includes(searchTerm) ||
              token.contract_id.toLowerCase().includes(searchTerm)) &&
            (!(
              ((this.chosenTokens?.[0] || this.chosenTokens?.[1]) &&
                this.chosenTokens.find((t) => t?.symbol === 'AE' && t.contract_id === this.WAE) &&
                token.symbol === 'WAE' &&
                token.contract_id === this.WAE) ||
              ((this.chosenTokens?.[0] || this.chosenTokens?.[1]) &&
                this.chosenTokens.find((t) => t?.symbol === 'WAE' && t.contract_id === this.WAE) &&
                token.symbol === 'AE' &&
                token.contract_id === this.WAE)
            ) ||
              !this.aeVsWae) &&
            (token.symbol !== 'WAE' || !this.excludeWae),
        );
    },
    filteredInActiveProvidersTokens() {
      const searchTerm = this.searchTerm.trim().toLowerCase();

      return this.getAvailableTokens(false)
        .filter((token) => token.networkId === this.networkId)
        .filter(
          (token) =>
            !searchTerm ||
            token.symbol.toLowerCase().includes(searchTerm) ||
            token.name.toLowerCase().includes(searchTerm) ||
            token.contract_id.toLowerCase().includes(searchTerm),
        );
    },
    modalTitle() {
      if (this.tab === 'manage-token-list') {
        return this.$t('manage');
      }
      if (this.tab === 'import-token') {
        return this.$t('importToken');
      }
      return this.$t('selectToken');
    },
  },
  watch: {
    async filteredActiveProvidersTokens(tokens) {
      /**
       * Load AEX9 contract token info if found
       */
      if (!tokens.length && this.searchTerm && this.searchTerm.includes('ct_')) {
        this.loadingExtraTokens = true;
        try {
          const token = await this.$store.dispatch(
            'aeternity/getTokenInstanceMetaInfo',
            this.searchTerm,
          );

          this.extraTokens = [
            {
              ...token.decodedResult,
              decimals: 18,
              contract_id: this.searchTerm,
            },
          ];
        } catch (error) {
          //
        }
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
        networkId: this.networkId,
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
  .token-list-container {
    display: flex;
    flex-direction: column;
    max-height: 50vh;
    min-height: 20vh;
  }

  .input-wrapper {
    margin: 0 20px 20px 20px;
  }

  .token-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 10px 0;
  }

  .manage-token-list {
    background-color: variables.$color-black2;
    color: variables.$color-gray2;
    padding: 20px 0;
    display: flex;
    align-items: center;
    justify-content: center;

    @extend %face-sans-14-medium;

    &:hover {
      cursor: pointer;
      color: variables.$color-white;
    }

    svg {
      width: 14px;
      height: 14px;
      margin-right: 6px;
    }
  }

  .back-button svg {
    width: 18px;
    height: 18px;
  }

  .loading {
    margin: auto;
    width: 150px;
    height: 150px;
  }
}
</style>

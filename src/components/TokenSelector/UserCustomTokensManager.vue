<template>
  <div class="user-custom-tokens-manager">
    <div class="input-wrapper">
      <InputField
        v-model:value="searchTerm"
        :placeholder="$t('searchTokenInput')"
        class="search-bar"
      />
    </div>

    <div class="token-list-wrapper">
      <ListTokens
        v-if="!userTokens.filter(t => t.contract_id === searchTerm).length && extraTokens.length"
        class="custom-list"
        :tokens="extraTokens"
        :active-tokens="activeTokens"
        import-token
        @token:import="$emit('token:import', $event)"
      />

      <div class="filters">
        {{ $t('customTokens', { n: tokens.length }) }}
        <ButtonPlain
          v-if="tokens.length"
          class="clear-all"
          @click.prevent="removeAllTokens()"
        >
          {{ $t('clearAll') }}
        </ButtonPlain>
      </div>

      <div
        v-for="token in tokens"
        :key="token.contract_id"
        class="token"
      >
        <div class="wrapper">
          <div class="row">
            <TokenIcon :token-a="token" />
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
            <ButtonPlain
              class="delete"
              @click.prevent="removeToken(token)"
            >
              <DeleteIcon />
            </ButtonPlain>
            <a
              v-if="activeNetwork"
              :href="`${activeNetwork.explorerUrl}/contracts/${token.contract_id}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon aria-hidden="true" />
              <span class="sr-only">External link</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="token-list-footer">
      {{ $t('tokenSelector.userCustomTokensManagerFooter') }}
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

import DeleteIcon from '@/assets/delete.svg';
import ExternalLinkIcon from '@/assets/external-link.svg';
import ListTokens from './ListTokens.vue';
import InputField from '../InputField.vue';
import ButtonPlain from '../ButtonPlain.vue';
import TokenIcon from '../TokenIcon.vue';

export default {
  components: {
    ListTokens,
    InputField,
    ButtonPlain,
    TokenIcon,
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
    ...mapState(['networkId']),
    ...mapGetters('tokens', ['getAvailableTokens']),
    ...mapGetters(['activeNetwork']),
    tokens() {
      const searchTerm = this.searchTerm.trim().toLowerCase();
      return this.userTokens
        .filter((token) => token.networkId === this.networkId)
        .filter((token) => (!searchTerm
          || token.symbol.toLowerCase().includes(searchTerm)
          || token.name.toLowerCase().includes(searchTerm)
          || token.contract_id.toLowerCase().includes(searchTerm)
        ));
    },
    activeTokens() {
      return this.getAvailableTokens().filter((token) => token.networkId === this.networkId);
    },
  },
  watch: {
    async tokens(tokens) {
      /**
       * Load AEX9 contract token info if found
       */
      if (!tokens.length && this.searchTerm && this.searchTerm.includes('ct_')) {
        this.loadingExtraTokens = true;
        try {
          const token = await this.$store.dispatch('aeternity/getTokenInstanceMetaInfo', this.searchTerm);

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
  methods: mapMutations('tokens', ['removeToken', 'removeAllTokens']),
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables.scss';
@use '../../styles/typography.scss';
@use './style.scss';

.user-custom-tokens-manager {
  width: 100%;
  padding-top: 16px;

  .token-list-wrapper {
    display: flex;
    flex-direction: column;
    max-height: 50vh;
    min-height: 40vh;
    overflow-y: auto;
    color: variables.$color-white;

    .filters {
      display: flex;
      justify-content: space-between;
      padding: 15px 20px;
      color: variables.$color-gray2;

      @extend %face-sans-14-regular;

      .clear-all {
        color: variables.$color-primary;

        &:hover {
          color: variables.$color-primary-light;
        }
      }
    }
  }

  .token-list-footer {
    background-color: variables.$color-black2;
    color: variables.$color-gray2;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    @extend %face-sans-14-medium;
  }
}
</style>

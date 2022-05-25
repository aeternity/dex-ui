<template>
  <div class="user-custom-tokens-manager">
    <div class="input-wrapper">
      <InputField
        v-model:value="searchTerm"
        placeholder="Search name or paste address"
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
        {{ tokens.length }} Custom Tokens
        <ButtonPlain
          v-if="tokens.length"
          class="clear-all"
          @click.prevent="removeAllTokens()"
        >
          Clear all
        </ButtonPlain>
      </div>

      <div
        v-for="token in tokens"
        :key="token.contract_id"
        class="token"
      >
        <div class="wrapper">
          <div class="row">
            <img :src="`https://avatars.z52da5wt.xyz/${token.contract_id}`">
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
            >
              <ExternalLinkIcon />
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="token-list-footer">
      Custom tokens are stored locally in your browser
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

import ListTokens from './ListTokens.vue';
import InputField from '../InputField.vue';
import ButtonPlain from '../ButtonPlain.vue';
import DeleteIcon from '../../assets/delete.svg?vue-component';
import ExternalLinkIcon from '../../assets/external-link.svg?vue-component';

export default {
  components: {
    ListTokens,
    InputField,
    ButtonPlain,
    DeleteIcon,
    ExternalLinkIcon,
  },
  emits: ['token:import'],
  data: () => ({
    searchTerm: '',
    extraTokens: [],
  }),
  computed: {
    ...mapState('tokens', ['providers', 'userTokens']),
    ...mapState(['networkId']),
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
      const tokens = [];
      this.providers
        .filter((provider) => provider.active)
        .forEach((provider) => {
          tokens.push(...provider.tokens);
        });
      tokens.push(...this.userTokens);
      return tokens.filter((token) => token.networkId === this.networkId);
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

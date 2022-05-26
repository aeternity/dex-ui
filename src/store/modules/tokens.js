import { DEFAULT_NETWORKS } from '../../lib/constants';
import { fetchJson } from '../../lib/utils';

export default {
  namespaced: true,
  state: {
    userTokens: [],
    providers: [
      {
        name: 'DEX',
        icon: null,
        active: true,
        tokens: [],
      },
    ],
  },
  mutations: {
    addToken(state, token) {
      state.userTokens.push(token);
    },
    removeToken(state, token) {
      state.userTokens = state.userTokens
        .filter((_token) => _token.contract_id !== token.contract_id);
    },
    removeAllTokens(state) {
      state.userTokens = [];
    },
    toggleProvider(state, provider) {
      state.providers = state.providers.map((_provider) => {
        if (provider.name === _provider.name) {
          return {
            ..._provider,
            active: !_provider.active,
          };
        }
        return _provider;
      });
    },
    updateTokens(state, { providerName, networkId, tokens }) {
      state.providers = state.providers.map((provider) => {
        if (providerName !== provider.name) {
          return provider;
        }
        const { waeAddress } = DEFAULT_NETWORKS.find((network) => network.networkId === networkId);
        const restOfTheTokens = provider.tokens.filter(
          (token) => token.networkId !== networkId || token.contract_id === waeAddress,
        );
        const newTokens = restOfTheTokens.concat(tokens
          .filter((token) => token.contract_id !== waeAddress)
          .map((token) => ({
            ...token,
            networkId,
          })));

        return {
          ...provider,
          tokens: newTokens,
        };
      });
    },
    initDefaultTokens(state) {
      const tokens = [];

      DEFAULT_NETWORKS.forEach((network) => tokens.push(...network.tokens.map((token) => ({
        ...token,
        networkId: network.networkId,
      }))));

      state.providers = [
        {
          name: 'DEX',
          icon: null,
          active: true,
          tokens,
        },
        ...state.providers.filter((p) => p.name !== 'DEX'),
      ];
    },
    addProvider(state, provider) {
      state.providers = [
        ...state.providers.filter((p) => p.name !== provider.name),
        provider,
      ];
    },
  },
  actions: {
    async fetchAllTokens({
      commit,
      rootGetters: { activeNetwork },
      state: { providers },
    }) {
      if (activeNetwork) {
        const tokens = await fetchJson(`${activeNetwork.middlewareUrl}/aex9/by_name`);
        if (Array.isArray(tokens)) {
          commit('addProvider', {
            name: 'AE MDW',
            icon: null,
            active: false,
            ...providers.find((provider) => provider.name === 'AE MDW'),
            tokens: tokens.map((token) => ({
              ...token,
              provider: 'AE MDW',
              networkId: activeNetwork.networkId,
            })),
          });
        }
      }
    },
  },
};

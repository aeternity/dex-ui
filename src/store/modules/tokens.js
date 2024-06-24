import { DEFAULT_NETWORKS } from '@/lib/constants';
import { fetchJson } from '@/lib/utils';

export default {
  namespaced: true,
  state: {
    userTokens: [],
    providers: [
      {
        name: 'Superhero DEX Selection',
        icon: null,
        active: true,
        tokens: [],
      },
    ],
  },
  getters: {
    getAvailableTokens:
      ({ providers, userTokens }) =>
      (isActive = true) => {
        const encounteredKeys = {};
        return providers
          .reduce((a, b) => a.concat(b.active === isActive ? b.tokens : []), [])
          .concat(userTokens)
          .filter((token) => {
            if (encounteredKeys[token.contract_id]) return false;
            encounteredKeys[token.contract_id] = true;
            return true;
          });
      },
  },
  mutations: {
    addToken(state, token) {
      state.userTokens.push(token);
    },
    removeToken(state, token) {
      state.userTokens = state.userTokens.filter(
        (_token) => _token.contract_id !== token.contract_id,
      );
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
        const newTokens = restOfTheTokens.concat(
          tokens
            .filter((token) => token.contract_id !== waeAddress)
            .map((token) => ({
              ...token,
              networkId,
            })),
        );

        return {
          ...provider,
          tokens: newTokens,
        };
      });
    },
    initDefaultTokens(state) {
      const tokens = [];

      DEFAULT_NETWORKS.forEach((network) =>
        tokens.push(
          ...network.tokens.map((token) => ({
            ...token,
            networkId: network.networkId,
          })),
        ),
      );

      state.providers = [
        {
          name: 'Superhero DEX Selection',
          icon: null,
          active: true,
          tokens,
        },
        ...state.providers.filter((p) => p.name !== 'Superhero DEX Selection'),
      ];
    },
    addProvider(state, provider) {
      state.providers = [...state.providers.filter((p) => p.name !== provider.name), provider];
    },
  },
  actions: {
    async fetchAllTokens({ commit, rootGetters: { activeNetwork }, state: { providers } }) {
      if (activeNetwork) {
        const tokens = await fetchJson(`${activeNetwork.middlewareUrl}/aex9/by_name`);
        if (Array.isArray(tokens)) {
          commit('addProvider', {
            name: 'AE Middleware List',
            icon: null,
            active: false,
            ...providers.find((provider) => provider.name === 'AE Middleware List'),
            tokens: tokens.map((token) => ({
              ...token,
              provider: 'AE Middleware List',
              networkId: activeNetwork.networkId,
            })),
          });
        }
      }
    },
    async fetchToken({ rootGetters: { activeNetwork } }, token) {
      if (!activeNetwork) return null;
      return fetchJson(`${activeNetwork.middlewareUrl}/v3/aex9/${token}`);
    },
  },
};

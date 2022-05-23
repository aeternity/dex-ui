import {
  handleUnknownError,
  getPairId,
} from '../../lib/utils';

export default {
  namespaced: true,

  state: {
    pairs: null,
  },
  getters: {
    getPairInfo: ({ pairs }) => ({ tokenA, tokenB }) => pairs && pairs[getPairId(tokenA, tokenB)],
  },
  mutations: {
    setPairs(state, pairs) {
      state.pairs = pairs;
    },
  },
  actions: {
    async init({ dispatch }) {
      await dispatch('fetchPairs');
    },

    async safeFetch({ rootGetters: { activeNetwork } }, url) {
      if (activeNetwork) {
        let timeoutId;
        try {
          const baseUrl = (activeNetwork.dexBackendUrl || '');
          const fullUrl = `${
            baseUrl.endsWith('/') ? baseUrl.slice(0, baseUrl.length - 1) : baseUrl
          }/${url.startsWith('/') ? url.slice(1) : url}`;

          const timeout = parseInt(
            process.env.VUE_APP_DEX_BACKEND_FETCH_TIMEOUT || '2000', 10,
          );
          const controller = new AbortController();
          timeoutId = setTimeout(() => controller.abort(), timeout);
          const resp = await fetch(fullUrl, {
            method: 'GET',
            signal: controller.signal,
          });
          const body = await resp.json();
          if (!resp.ok) {
            throw new Error(JSON.stringify({ status: resp.status, body }));
          }
          return body;
        } catch (err) {
          handleUnknownError(err);
          return null;
        } finally {
          clearTimeout(timeoutId);
        }
      }
      return null;
    },

    async fetchPairDetails({ state: { pairs }, dispatch }, { tokenA, tokenB }) {
      const pairId = getPairId(tokenA, tokenB);
      const pair = pairs[pairId];
      if (!pair) return null;
      const resp = await dispatch('safeFetch', `pairs/by-address/${pair.address}`);
      return resp && {
        ...resp,
        liquidityInfo: resp.liquidityInfo && {
          ...resp.liquidityInfo,
          reserve0: BigInt(resp.liquidityInfo.reserve0),
          reserve1: BigInt(resp.liquidityInfo.reserve1),
          totalSupply: BigInt(resp.liquidityInfo.totalSupply),
        },
      };
    },

    async fetchPairs({ dispatch, commit }, onlyListed) {
      const pairsXs = await dispatch('safeFetch', `pairs?only-listed=${!!onlyListed}`);
      if (!pairsXs) {
        return null;
      }
      const pairs = {};
      pairsXs.forEach((pair) => {
        pairs[getPairId(pair.token0, pair.token1)] = pair;
      });
      commit('setPairs', pairs);
      return pairs;
    },
  },
};

import {
  handleUnknownError,
  getPairId,
} from '../../lib/utils';

export default {
  namespaced: true,

  state: {
    failed: false,
    pairs: null,
  },
  getters: {
    getPairInfo: ({ pairs }) => ({ tokenA, tokenB }) => pairs && pairs[getPairId(tokenA, tokenB)],
  },
  mutations: {
    setPairs(state, pairs) {
      state.pairs = pairs;
    },
    failed(state, didFailed) {
      state.failed = !!didFailed;
    },
  },
  actions: {
    async init({ dispatch, commit }) {
      commit('setPairs', null);
      await dispatch('fetchPairs');
    },
    async safeFetch({
      dispatch, commit, state: { failed }, rootGetters: { activeNetwork },
    }, { url, manageFailingStatus = true }) {
      if (activeNetwork) {
        let timeoutId;
        try {
          const baseUrl = (activeNetwork.dexBackendUrl || '');
          const fullUrl = `${
            baseUrl.endsWith('/') ? baseUrl.slice(0, baseUrl.length - 1) : baseUrl
          }${url.startsWith('/') ? '' : '/'}${url}`;

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
          // even if resp.ok == false we don't consider dex-backend down
          if (manageFailingStatus && failed) {
            // checkStatus if it previously failed
            dispatch('checkStatus');
          }
          if (!resp.ok) {
            handleUnknownError({ status: resp.status, body });
            return null;
          }
          return body;
        } catch (err) {
          if (manageFailingStatus) {
            commit('failed', true);
          }
          handleUnknownError(err);
          return null;
        } finally {
          clearTimeout(timeoutId);
        }
      }
      return null;
    },
    async checkStatus({ dispatch, commit, state: { pairs } }) {
      const resp = await dispatch(
        'safeFetch',
        { url: 'global-state', dontSetFailingStatus: true },
      );
      const up = !!resp && resp.pairsSyncedPercent >= 100;
      if (!pairs && up) {
        await dispatch('fetchPairs');
      }
      commit('failed', !up);
      return up;
    },
    async fetchPairDetails({ state: { pairs }, dispatch }, { tokenA, tokenB }) {
      const pairId = getPairId(tokenA, tokenB);
      const pair = pairs[pairId];
      if (!pair) return null;
      const resp = await dispatch('safeFetch', { url: `pairs/by-address/${pair.address}` });
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
      const pairsXs = await dispatch('safeFetch', { url: `pairs?only-listed=${!!onlyListed}` });
      if (!pairsXs) return null;
      const pairs = {};
      pairsXs.forEach((pair) => {
        pairs[getPairId(pair.token0, pair.token1)] = pair;
      });
      commit('setPairs', pairs);
      return pairs;
    },
  },
};

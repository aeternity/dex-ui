import { handleUnknownError, getPairId, isDexBackendDisabled } from '@/lib/utils';

export default {
  namespaced: true,

  state: {
    failed: isDexBackendDisabled,
    pairs: null,
    tokensUpdatedFor: {},
  },
  getters: {
    getPairInfo:
      ({ pairs }) =>
      ({ tokenA, tokenB }) =>
        pairs && pairs[getPairId(tokenA, tokenB)],
  },
  mutations: {
    setPairs(state, pairs) {
      state.pairs = pairs;
    },
    failed(state, didFailed) {
      state.failed = !!didFailed;
    },
    markTokensAsUpdatedFor(state, { networkId, updated }) {
      state.tokensUpdatedFor[networkId] = updated;
    },
  },
  actions: {
    async init({ dispatch, commit }) {
      commit('setPairs', null);
      await dispatch('fetchPairs');
      await dispatch('ensureTokensList');
    },

    async ensureTokensList({
      state: { failed, tokensUpdatedFor },
      dispatch,
      commit,
      rootGetters: {
        activeNetwork: { networkId },
      },
    }) {
      if (tokensUpdatedFor[networkId] || isDexBackendDisabled) return;
      // check if tokens list was already updated
      const tokens = await dispatch('getListedTokens');
      // abort if it failed in the meantime
      // or no tokens were provided during the tokens list fetching
      if (failed || !tokens) {
        commit('markTokensAsUpdatedFor', { networkId, updated: false });
        return;
      }
      commit('markTokensAsUpdatedFor', { networkId, updated: true });
      // and finally if everything gone well replace the tokens with
      // the dex-backend official list of tokens
      commit(
        'tokens/updateTokens',
        {
          providerName: 'Superhero DEX Selection',
          networkId,
          tokens,
        },
        { root: true },
      );
    },
    async safeFetch(
      { dispatch, commit, state: { failed }, rootGetters: { activeNetwork } },
      { url, manageFailingStatus = true },
    ) {
      if (activeNetwork && !isDexBackendDisabled) {
        let timeoutId;
        try {
          const baseUrl = activeNetwork.dexBackendUrl || '';
          const fullUrl = `${
            baseUrl.endsWith('/') ? baseUrl.slice(0, baseUrl.length - 1) : baseUrl
          }${url.startsWith('/') ? '' : '/'}${url}`;

          const timeout = parseInt(import.meta.env.VITE_DEX_BACKEND_FETCH_TIMEOUT || '2000', 10);
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
      if (isDexBackendDisabled) return false;
      const resp = await dispatch('safeFetch', { url: 'global-state', dontSetFailingStatus: true });
      const up = !!resp && resp.pairsSyncedPercent >= 100;
      commit('failed', !up);
      if (up) {
        // fetch pairs only if weren't already fetched
        if (!pairs) await dispatch('fetchPairs');
        await dispatch('ensureTokensList');
      }
      return up;
    },

    async fetchPairDetails(
      { getters: { getPairInfo }, dispatch },
      { pairAddress, tokenA, tokenB },
    ) {
      let pair;
      if (!pairAddress) {
        pair = getPairInfo({ tokenA, tokenB });
        if (!pair) return null;
      }
      const resp = await dispatch('safeFetch', {
        url: `pairs/${pairAddress || pair.address}`,
      });
      return (
        resp && {
          ...resp,
          liquidityInfo: resp.liquidityInfo && {
            ...resp.liquidityInfo,
            reserve0: BigInt(resp.liquidityInfo.reserve0),
            reserve1: BigInt(resp.liquidityInfo.reserve1),
            totalSupply: BigInt(resp.liquidityInfo.totalSupply),
          },
        }
      );
    },

    async fetchSwapRoutes({ dispatch }, { tokenA, tokenB }) {
      return dispatch('safeFetch', { url: `swap-routes/${tokenA}/${tokenB}` });
    },

    async getListedTokens({ dispatch }) {
      const tokens = await dispatch('safeFetch', { url: 'tokens/listed' });
      if (!tokens) return null;
      return tokens.map(({ address, ...tail }) => ({
        ...tail,
        contract_id: address,
      }));
    },

    async getTokenWithUsd({ dispatch }, tokenId) {
      return dispatch('safeFetch', { url: `tokens/${tokenId}` });
    },

    async getAllTokens({ dispatch }) {
      return dispatch('safeFetch', { url: 'tokens' });
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

    async fetchHistory({ dispatch }, options) {
      // fetch the full history with all pages
      let history = [];
      let offset = 0;
      const limit = 9999999;
      let page;
      do {
        const queryString = new URLSearchParams({
          limit,
          offset,
          ...options,
        }).toString();
        // eslint-disable-next-line no-await-in-loop
        page = await dispatch('safeFetch', { url: `history?${queryString}` });
        if (!page) break;
        history = history.concat(page);
        offset += limit;
      } while (page.length === limit);

      return history;
    },

    async fetchPairsByToken({ dispatch }, tokenId) {
      return dispatch('safeFetch', { url: `tokens/${tokenId}/pairs` });
    },

    async fetchPairsByTokenUsd({ dispatch }, tokenId) {
      return dispatch('safeFetch', { url: `pairs?token=${tokenId}` });
    },

    async fetchGraph({ dispatch }, options) {
      const queryString = new URLSearchParams(options).toString();
      return dispatch('safeFetch', { url: `graph?${queryString}` });
    },
  },
};

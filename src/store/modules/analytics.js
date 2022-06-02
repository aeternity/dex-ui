import { fetchJson } from '../../lib/utils';

export default {
  namespaced: true,
  state: {
    currency: 'usd',
    aeCoin: {},
  },
  mutations: {
    setAeCoin(state, aeCoin) {
      state.aeCoin = aeCoin;
    },
    setCurrency(state, currency) {
      state.currency = currency;
    },
  },
  actions: {
    async init({ dispatch }) {
      await dispatch('fetchAeCoinInfo');
    },
    async fetchAeCoinInfo({
      commit,
      state: { currency },
    }) {
      const markets = await fetchJson(
        `https://api.coingecko.com/api/v3/coins/markets?ids=aeternity&vs_currency=${currency}`,
      );
      if (markets && markets.length) {
        console.info('========================');
        console.info('fetchAeCoinInfo.markets[0] ::', markets[0]);
        console.info('========================');

        commit('setAeCoin', markets[0]);
      }
    },
  },
};

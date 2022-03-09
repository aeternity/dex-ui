export default {
  namespaced: true,

  state: {
    pool: null,
    swap: null,
  },
  mutations: {
    setPool(state, query) {
      state.pool = query;
    },
    setSwap(state, query) {
      state.swap = query;
    },
  },
};

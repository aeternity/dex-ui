export default {
  namespaced: true,

  state: {
    pool: null,
    swap: null,
  },
  mutations: {
    setPool(state, query) {
      state.pool = {
        ...state.pool,
        ...query,
      };
    },
    setSwap(state, query) {
      state.swap = {
        ...state.swap,
        ...query,
      };
    },
  },
};

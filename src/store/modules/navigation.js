export default {
  namespaced: true,

  state: {
    pool: null,
    swap: null,
  },
  mutations: {
    setPool(state, query) {
      if (!query) {
        state.pool = null;
      } else {
        state.pool = {
          ...state.pool,
          ...query,
        };
      }
    },
    setSwap(state, query) {
      if (!query) {
        state.swap = null;
      } else {
        state.swap = {
          ...state.swap,
          ...query,
        };
      }
    },
  },
};

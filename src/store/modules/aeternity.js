import routerInterface from '../../contracts/IAedexV2Router.aes';
import waeInterface from '../../contracts/IWAE.aes';
import aex9Inteface from '../../contracts/IAEX9Minimal.aes';

// TODO: this should be reviewed
const MaxUint256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;

const getRouterInstance = (sdk) => sdk.getContractInstance(
  {
    source: routerInterface,
    contractAddress: process.env.VUE_APP_ROUTER_ADDRESS,
  },
);
const getTokenInstance = (sdk, address) => sdk.getContractInstance(
  {
    source: aex9Inteface,
    contractAddress: address,
  },
);
const getAddress = (x) => x.deployInfo.address;
const cttoak = (value) => value.replace('ct_', 'ak_');
const getCtAddress = (contract) => cttoak(getAddress(contract));

// TODO: is this the case?
const extraGas = {
  gas: 150000,
};

export default {
  namespaced: true,

  state: {
    router: null,
    wae: null,
  },

  getters: {
  },

  mutations: {
    setWaeInstance(state, instance) {
      state.wae = instance;
    },
    setRouterInstance(state, instance) {
      state.router = instance;
    },
  },

  actions: {
    async initRouter({ commit }, sdk) {
      const contract = await getRouterInstance(sdk);
      commit('setRouterInstance', contract);
    },
    async initWae({ commit }, sdk) {
      const contract = await sdk.getContractInstance(
        {
          source: waeInterface,
          contractAddress: process.env.VUE_APP_WAE_ADDRESS,
        },
      );
      commit('setWaeInstance', contract);
    },

    /**
     * @description remove the liquidity provided to a pair
     * for p2.tokenA*p2.tokenB
     * NOTE: before calling this you should call `pair.create_allowance` allowing
     * router to withdraw liquidity tokens from the pair
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA
     * @param {string} p2.tokenB
     * @param {bigint} p2.liquidity
     * @param {bigint | null} p2.amountAMin
     * @param {bigint | null} p2.amountBMin
     * @param {bigint | null} p2.deadline
     * @return {Promise<[bigint,bigint]>}
     * amounts removed for tokenA and tokenB
    */
    async removeLiquidity({
      state: { router },
      rootState: { address: to },
    }, {
      tokenA, tokenB,
      liquidity,
      amountAMin,
      amountBMin,
      deadline,
    }) {
      const { decodedResult } = router.methods.remove_liquidity(
        tokenA,
        tokenB,
        liquidity,
        amountAMin || 0n,
        amountBMin || 0n,
        to,
        deadline || MaxUint256,
        extraGas,
      );
      return decodedResult;
    },

    /**
     * @description remove the liquidity provided to a pair of p2.token*wae
     * NOTE: before calling this you should call `waePair.create_allowance` allowing
     * router to withdraw liquidity tokens from the pair
     * @async
     * @param p1 vuex context
     * @param {string} p2.token
     * @param {bigint} p2.liquidity
     * @param {bigint | null} p2.amountTokenMin
     * @param {bigint | null} p2.amountAEMin
     * @param {bigint | null} p2.deadline
     * @return {Promise<[bigint,bigint]>}
     * amounts removed for token and wae
    */
    async removeLiquidityAe({
      state: { router },
      rootState: { address: to },
    }, {
      token,
      liquidity,
      amountTokenMin,
      amountAEMin,
      deadline,
    }) {
      await router.methods.remove_liquidity_ae(
        token,
        liquidity,
        amountTokenMin || 0n,
        amountAEMin || 0n,
        to,
        deadline,
        extraGas,
      );
    },

    /**
     * @description create allowance for a token AEX9 complient
     * NOTE: the pairs created by the dex-factory are also AEX9 complient
     * @async
     * @param p1 vuex context
     * @param {string} p2.token
     * @param {bigint} p2.amount
    */
    async createAllowance({
      rootState: { sdk },
      state: { router },
    }, {
      token: tokenAddress,
      amount,
    }) {
      const token = await getTokenInstance(sdk, tokenAddress);
      const routerAddr = getCtAddress(router);
      await token.methods.create_allowance(
        routerAddr,
        amount ?? MaxUint256,
      );
    },

    /**
     * @description adds liquidity to a pair of tokenA*tokenB
     * NOTE: before calling this you should call `tokenA.create_allowance`
     * and `tokenB.create_allowance` allowing the router to transfer tokens
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA
     * @param {string} p2.tokenB
     * @param {bigint} p2.amountADesired
     * @param {bigint} p2.amountBDesired
     * @param {bigint | null} p2.amountAMin
     * @param {bigint | null} p2.amountBMin
     * @param {bigint | null} p2.deadline
     * @return {Promise<[bigint,bigint,liquidity]>}
     * amounts transfered for tokenA and tokenB and the liquidity
    */
    async addLiquidity({
      state: {
        router,
      },
      rootState: { address: to },
    }, {
      tokenA, tokenB,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      deadline,
    }) {
      const { decodedResult } = await router.methods.add_liquidity(
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        amountAMin || 0n,
        amountBMin || 0n,
        to,
        deadline || MaxUint256,
        extraGas,
      );
      return decodedResult;
    },

    /**
     * @description adds liquidity to a pair of token*wae
     * NOTE: before calling this you should call `token.create_allowance`
     * allowing the router to transfer tokens
     * @async
     * @param p1 vuex context
     * @param {string} p2.token
     * @param {bigint} p2.amountTokenDesired
     * @param {bigint} p2.amountAeDesired
     * @param {bigint | null} p2.amountTokenMin
     * @param {bigint | null} p2.amountAeMin
     * @param {bigint | null} p2.deadline
     * @return {Promise<[bigint,bigint,liquidity]>}
     * amounts transfered for token and AE and the liquidity
    */
    async addLiquidityAe({
      state: {
        router,
      },
      rootState: { address: to },
    }, {
      token,
      amountTokenDesired,
      amountAeDesired,
      amountTokenMin,
      amountAeMin,
      deadline,
    }) {
      const { decodedResult } = await router.methods.add_liquidity_ae(
        token,
        amountTokenDesired,
        amountTokenMin || 0n,
        amountAeMin || 0n,
        to,
        deadline, {
          ...extraGas,
          amount: amountAeDesired.toString(),
        },
      );
      return decodedResult;
    },

    /**
     * @description
     * NOTE: before calling this you should call `path[0].create_allowance`
     * allowing the router to transfer tokens from the first token balance
     * @param p1 vuex context
     * @param {bigint} p2.amountIn exact amount for the token found at path[0]
     * @param {bigint | null} p2.amountOutMin minimal amount out for the token found at path[n-1]
     * @returns {bigint[]} representing amounts out for every token from the path
    */
    async swapExactTokensForTokens({
      state: { router },
      rootState: { address: to },
    }, {
      amountIn,
      amountOutMin,
      path,
    }) {
      const { decodedResult } = await router.methods.swap_exact_tokens_for_tokens(
        amountIn,
        amountOutMin || 0n,
        path,
        to,
        undefined,
        extraGas,
      );
      return decodedResult;
    },

    /**
     * @description
     * NOTE: before calling this you should call `path[0].create_allowance`
     * allowing the router to transfer tokens from the first token balance
     * @param p1 vuex context
     * @param {bigint} p2.amountOut exact amount for the token found at path[n-1]
     * @param {bigint | null} p2.amountInMax max amount in for the token found at path[0]
     * @returns {bigint[]} representing amounts in for every token from the path
    */
    async swapTokensForExactTokens({
      state: { router },
      rootState: { address: to },
    }, {
      amountOut,
      amountInMax,
      path,
      deadline,
    }) {
      const { decodedResult } = await router.methods.swap_tokens_for_exact_tokens(
        amountOut,
        amountInMax ?? MaxUint256,
        path,
        to,
        deadline,
        undefined,
        extraGas,
      );
      return decodedResult;
    },

    /**
     * @param p1 vuex context
     * @param {bigint} p2.amountAeIn exact amount in for the AE found at path[0]
     * @param {bigint | null} p2.amountOutMin min amount out for the token found at path[n-1]
     * @returns {bigint[]} representing amounts out for every token from the path
    */
    async swapExactAeForTokens({
      state: { router },
      rootState: { address: to },
    }, {
      amountAeIn,
      amountOutMin,
      path,
      deadline,
    }) {
      const { decodedResult } = await router.methods.swap_exact_ae_for_tokens(
        amountOutMin || 0n,
        path,
        to,
        deadline,
        undefined, {
          ...extraGas,
          amount: amountAeIn.toString(),
        },
      );
      return decodedResult;
    },

    /**
     * @description
     * NOTE: before calling this you should call `path[0].create_allowance`
     * allowing the router to transfer tokens from the first token balance
     * @param p1 vuex context
     * @param {bigint} p2.amountAeOut exact amount out for the AE found at path[n-1]
     * @param {bigint | null} p2.amountTokenInMax max amount in for the token found at path[0]
     * @returns {bigint[]} representing amounts in for every token from the path
    */
    async swapTokensForExactAe({
      state: { router },
      rootState: { address: to },
    }, {
      amountAeOut,
      amountTokenInMax,
      path,
      deadline,
    }) {
      const { decodedResult } = await router.methods.swap_tokens_for_exact_ae(
        amountAeOut,
        amountTokenInMax ?? MaxUint256,
        path,
        to,
        deadline,
        undefined,
        extraGas,
      );
      return decodedResult;
    },

    /**
     * @description
     * NOTE: before calling this you should call `path[0].create_allowance`
     * allowing the router to transfer tokens from the first token balance
     * @param p1 vuex context
     * @param {bigint} p2.amountIn exact amount in for the token found at path[0]
     * @param {bigint | null} p2.amountAeOutMin minimal amount out for the AE found at path[n-1]
     * @returns {bigint[]} representing amounts out for every token from the path
    */
    async swapExactTokensForAe({
      state: { router },
      rootState: { address: to },
    }, {
      amountIn,
      amountAeOutMin,
      path,
      deadline,
    }) {
      const { decodedResult } = await router.methods.swap_exact_tokens_for_ae(
        amountIn,
        amountAeOutMin ?? 0n,
        path,
        to,
        deadline,
        undefined,
        extraGas,
      );
      return decodedResult;
    },

    /**
     * @param p1 vuex context
     * @param {bigint} p2.amountOut exact amount out for the token found at path[n-1]
     * @param {bigint} p2.amountAeInMax max amount in for the AE found at path[0]
     * @returns {bigint[]} representing amounts in for every token from the path
    */
    async swapAeForExactTokens({
      state: { router },
      rootState: { address: to },
    }, {
      amountAeInMax,
      amountOut,
      path,
      deadline,
    }) {
      const { decodedResult } = await router.methods.swap_ae_for_exact_tokens(
        amountOut,
        path,
        to,
        deadline,
        undefined,
        {
          ...extraGas,
          amount: amountAeInMax.toString(),
        },
      );
      return decodedResult;
    },

  },
};

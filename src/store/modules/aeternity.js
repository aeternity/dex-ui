import routerInterface from '../../contracts/IAedexV2Router.aes';
import waeInterface from '../../contracts/IWAE.aes';
import aex9Inteface from '../../contracts/IAEX9Minimal.aes';

const defaultDeadline = () => Date.now() + 30 * 60000;

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

// TODO: remove this after testing the actual gas and before production
const extraGas = {
  gas: 150000,
};

/**
 * adds slippage to a given value
 * NOTE: both values should be biging
 * @async
 * @param value given value
 * @param slippage percentage (eg. 10,20...100)
 * @return biging representing final value
*/
const addSlippage = (value, slippage) => value + (value * slippage) / 100;
const subSlippage = (value, slippage) => value - (value * slippage) / 100;

export default {
  namespaced: true,

  state: {
    router: null,
    wae: null,
    // TODO: should this be the default?
    slippage: 10n,
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
    setSlippage(state, slippage) {
      state.slippage = slippage;
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
     * @param {bigint} p2.amountADesired
     * @param {bigint} p2.amountBDesired
     * @param {bigint | null} p2.deadline
     * @return {Promise<[bigint,bigint]>}
     * amounts removed for tokenA and tokenB
    */
    async removeLiquidity({
      state: { router, slippage },
      rootState: { address: to },
    }, {
      tokenA, tokenB,
      liquidity,
      amountADesired,
      amountBDesired,
      deadline,
    }) {
      const { decodedResult } = router.methods.remove_liquidity(
        tokenA,
        tokenB,
        liquidity,
        subSlippage(amountADesired, slippage), // minumum amount to be removed
        subSlippage(amountBDesired, slippage), // minumum amount to be removed
        to,
        deadline || defaultDeadline(),
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
     * @param {bigint} p2.amountTokenDesired
     * @param {bigint} p2.amountAEDesired
     * @param {bigint | null} p2.deadline
     * @return {Promise<[bigint,bigint]>}
     * amounts removed for token and wae
    */
    async removeLiquidityAe({
      state: { router, slippage },
      rootState: { address: to },
    }, {
      token,
      liquidity,
      amountTokenDesired,
      amountAEDesired,
      deadline,
    }) {
      await router.methods.remove_liquidity_ae(
        token,
        liquidity,
        subSlippage(amountTokenDesired, slippage), // minumum amount to be removed
        subSlippage(amountAEDesired, slippage), // minumum amount to be removed
        to,
        deadline || defaultDeadline(),
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
      state: { router },
      rootState: { sdk },
    }, {
      token: tokenAddress,
      amount,
    }) {
      const token = await getTokenInstance(sdk, tokenAddress);
      const routerAddr = getCtAddress(router);
      await token.methods.create_allowance(
        routerAddr,
        amount,
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
     * @param {bigint} p2.minimumLiquidity if the pair was not created at
     * the point of creation the factory needs the minimum liquidity value
     * @param {bigint | null} p2.deadline
     * @return {Promise<[bigint,bigint,liquidity]>}
     * amounts transfered for tokenA and tokenB and the liquidity
    */
    async addLiquidity({
      state: { router, slippage },
      rootState: { address: to },
    }, {
      tokenA, tokenB,
      amountADesired,
      amountBDesired,
      minimumLiquidity,
      deadline,
    }) {
      const { decodedResult } = await router.methods.add_liquidity(
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        subSlippage(amountADesired, slippage), // min amount to be added
        subSlippage(amountBDesired, slippage), // min amount to be added
        to,
        minimumLiquidity,
        deadline || defaultDeadline(),
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
     * @param {bigint | null} p2.deadline
     * @param {bigint} p2.minimumLiquidity if the pair was not created at
     * the point of creation the factory needs the minimum liquidity value
     * @return {Promise<[bigint,bigint,liquidity]>}
     * amounts transfered for token and AE and the liquidity
    */
    async addLiquidityAe({
      state: { router, slippage },
      rootState: { address: to },
    }, {
      token,
      amountTokenDesired,
      amountAeDesired,
      minimumLiquidity,
      deadline,
    }) {
      const { decodedResult } = await router.methods.add_liquidity_ae(
        token,
        amountTokenDesired,
        subSlippage(amountTokenDesired, slippage), // min amount
        subSlippage(amountAeDesired, slippage), // min amount
        to,
        minimumLiquidity,
        deadline || defaultDeadline(), {
          ...extraGas,
          amount: amountAeDesired.toString(), // if less is added the diff is returned at the end
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
     * @param {bigint} p2.amountOutDesired desired amount out for the token found at path[n-1]
     * @returns {bigint[]} representing amounts out for every token from the path
    */
    async swapExactTokensForTokens({
      state: { router, slippage },
      rootState: { address: to },
    }, {
      amountIn,
      amountOutDesired,
      path,
    }) {
      const { decodedResult } = await router.methods.swap_exact_tokens_for_tokens(
        amountIn,
        subSlippage(amountOutDesired, slippage),
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
     * @param {bigint} p2.amountInDesired desired amount in for the token found at path[0]
     * @returns {bigint[]} representing amounts in for every token from the path
    */
    async swapTokensForExactTokens({
      state: { router, slippage },
      rootState: { address: to },
    }, {
      amountOut,
      amountInDesired,
      path,
      deadline,
    }) {
      const { decodedResult } = await router.methods.swap_tokens_for_exact_tokens(
        amountOut,
        addSlippage(amountInDesired, slippage), // this is maximum
        path,
        to,
        deadline || defaultDeadline(),
        undefined,
        extraGas,
      );
      return decodedResult;
    },

    /**
     * @param p1 vuex context
     * @param {bigint} p2.amountAeIn exact amount in for the AE found at path[0]
     * @param {bigint} p2.amountOutDesired desired
     * amount out for the token found at path[n-1]
     * @returns {bigint[]} representing amounts out for every token from the path
    */
    async swapExactAeForTokens({
      state: { router, slippage },
      rootState: { address: to },
    }, {
      amountAeIn,
      amountOutDesired,
      path,
      deadline,
    }) {
      const { decodedResult } = await router.methods.swap_exact_ae_for_tokens(
        subSlippage(amountOutDesired, slippage),
        path,
        to,
        deadline || defaultDeadline(),
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
     * @param {bigint} p2.amountTokenInDesired desired amount in for the token found at path[0]
     * @returns {bigint[]} representing amounts in for every token from the path
    */
    async swapTokensForExactAe({
      state: { router, slippage },
      rootState: { address: to },
    }, {
      amountAeOut,
      amountTokenInDesired,
      path,
      deadline,
    }) {
      const { decodedResult } = await router.methods.swap_tokens_for_exact_ae(
        amountAeOut,
        addSlippage(amountTokenInDesired, slippage), // not more than this
        path,
        to,
        deadline || defaultDeadline(),
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
     * @param {bigint} p2.amountAeOutDesired desired amount out for the AE found at path[n-1]
     * @returns {bigint[]} representing amounts out for every token from the path
    */
    async swapExactTokensForAe({
      state: { router, slippage },
      rootState: { address: to },
    }, {
      amountIn,
      amountAeOutDesired,
      path,
      deadline,
    }) {
      const { decodedResult } = await router.methods.swap_exact_tokens_for_ae(
        amountIn,
        subSlippage(amountAeOutDesired, slippage), // no less than this
        path,
        to,
        deadline || defaultDeadline(),
        undefined,
        extraGas,
      );
      return decodedResult;
    },

    /**
     * @param p1 vuex context
     * @param {bigint} p2.amountOut exact amount out for the token found at path[n-1]
     * @param {bigint} p2.amountAeInDesired desired amount in for the AE found at path[0]
     * @returns {bigint[]} representing amounts in for every token from the path
    */
    async swapAeForExactTokens({
      state: { router, slippage },
      rootState: { address: to },
    }, {
      amountAeInDesired,
      amountOut,
      path,
      deadline,
    }) {
      const { decodedResult } = await router.methods.swap_ae_for_exact_tokens(
        amountOut,
        path,
        to,
        deadline || defaultDeadline(),
        undefined,
        {
          ...extraGas,
          // this is the diff between the desired+slippage and
          // the actual amount will be return into owner's wallet
          amount: addSlippage(amountAeInDesired, slippage).toString(),
        },
      );
      return decodedResult;
    },

  },
};

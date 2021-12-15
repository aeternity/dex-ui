import BigNumber from 'bignumber.js';
import routerInterface from '../../contracts/IAedexV2Router.aes';
import waeInterface from '../../contracts/IWAE.aes';
import aex9Inteface from '../../contracts/IAEX9Minimal.aes';
import factoryInteface from '../../contracts/IAedexV2Factory.aes';
import pairInteface from '../../contracts/IAedexV2Pair.aes';

const defaultDeadline = () => Date.now() + 30 * 60000;

export const getPriceImpact = (reserveA, reserveB, amountA) => {
  const k = BigNumber(reserveA).times(reserveB);
  const newReserveA = BigNumber(reserveA).plus(amountA);
  const newReserveB = k.div(newReserveA);
  const receivedB = BigNumber(reserveB).minus(newReserveB);
  const marketPrice = BigNumber(reserveA).div(reserveB);
  const newPrice = BigNumber(amountA).div(receivedB);

  return newPrice.minus(marketPrice).times(100).div(marketPrice).toNumber();
};
const getAddress = (x) => x.deployInfo.address;
const cttoak = (value) => value.replace('ct_', 'ak_');
const getCtAddress = (contract) => cttoak(getAddress(contract));

const sortTokens = (tokenA, tokenB, transform) => {
  const f = transform || ((x) => x);
  return (f(tokenA) < f(tokenB)) ? [tokenA, tokenB] : [tokenB, tokenA];
};
const getPairId = (tokenA, tokenB) => {
  const [token0, token1] = sortTokens(tokenA, tokenB);
  return `${token0}|${token1}`;
};

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
    factory: null,
    // TODO: should this be the default?
    slippage: 10n,
    pairs: {},
  },

  getters: {
  },

  mutations: {
    setWaeInstance(state, instance) {
      state.wae = instance;
    },
    setFactoryInstance(state, instance) {
      state.factory = instance;
    },
    setRouterInstance(state, instance) {
      state.router = instance;
    },
    setSlippage(state, slippage) {
      state.slippage = slippage;
    },
    addPair(state, { tokenA, tokenB, instance }) {
      state.pairs[getPairId(tokenA, tokenB)] = instance;
    },
  },

  actions: {
    async initRouter({ commit }, sdk) {
      const contract = await sdk.getContractInstance(
        {
          source: routerInterface,
          contractAddress: process.env.VUE_APP_ROUTER_ADDRESS,
        },
      );
      commit('setRouterInstance', contract);
    },
    async initFactory({ commit, state: { router } }, sdk) {
      const { decodedResult: factoryAddress } = await router.methods.factory();
      const contract = await sdk.getContractInstance(
        {
          source: factoryInteface,
          contractAddress: factoryAddress,
        },
      );

      commit('setFactoryInstance', contract);
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
     * @description retrieve the Pair and store it if it wasn't already fetched before
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @return {int | null} returns the pair instance
    */
    async getPairByTokens({
      commit,
      state: { factory, pairs },
      rootState: { sdk },
    }, {
      tokenA,
      tokenB,
    }) {
      const pair = pairs[getPairId(tokenA, tokenB)];
      if (pair) {
        return pair;
      }
      const { decodedResult: contractAddress } = await factory.methods.get_pair(tokenA, tokenB);
      if (contractAddress == null) {
        throw new Error('PAIR NOT FOUND');
      }
      const instance = sdk.getContractInstance(
        {
          source: pairInteface,
          contractAddress,
        },
      );
      commit('addPair', { tokenA, tokenB, instance });
      return instance;
    },
    getTokenInstance({ rootState: { sdk } }, contractAddress) {
      return sdk.getContractInstance({
        source: aex9Inteface,
        contractAddress,
      });
    },
    /**
     * @description retrieve the liquidity share from a pool
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @return {int | null} returns the owner liquidity
    */
    async getAccountLiquidity({
      dispatch,
      rootState: { address: owner },
    }, {
      tokenA, tokenB,
    }) {
      const pair = await dispatch('getPairByTokens', { tokenA, tokenB });

      const { decodedResult: balance } = await pair.methods.balance(owner);
      return balance;
    },
    /**
     * @description retrieve the total liquidity from a certain pool
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @return {int} returns the total supply/liquidity
    */
    async getTotalSupply({ dispatch }, { tokenA, tokenB }) {
      const pair = await dispatch('getPairByTokens', { tokenA, tokenB });
      const { decodedResult: totalSupply } = await pair.methods.total_supply();
      return totalSupply;
    },
    /**
     * @description get the rate of the pair
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @return {number} returns the (reserveTokenA/reserveTokenB)
    */
    async getRate({
      dispatch,
      rootState: { address: owner },
    }, {
      tokenA, tokenB,
    }) {
      const pair = await dispatch('getPairByTokens', { tokenA, tokenB });
      const { decodedResult: { reserve0, reserve1 } } = await pair.methods.get_reserves(owner);
      const { decodedResult: token0 } = await pair.methods.token0(owner);
      const [reserveA, reserveB] = token0 === tokenA
        ? [reserve0, reserve1]
        : [reserve1, reserve0];
      return reserveA / reserveB;
    },
    /**
     * @description get the price impact after the swap
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @param {bigint} p2.amountA tokenA amount to be swapped
     * @return {number} returns the (newPrice - oldPrice) * 100 / oldPrice
    */
    async getPriceImpact({
      dispatch,
      rootState: { address: owner },
    }, {
      tokenA, tokenB,
      amountA,
    }) {
      const pair = await dispatch('getPairByTokens', { tokenA, tokenB });
      const { decodedResult: { reserve0, reserve1 } } = await pair.methods.get_reserves(owner);
      const { decodedResult: token0 } = await pair.methods.token0(owner);
      const [reserveA, reserveB] = token0 === tokenA
        ? [reserve0, reserve1]
        : [reserve1, reserve0];
      return getPriceImpact(reserveA, reserveB, amountA);
    },
    /**
     * @description get infor about the pool
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @return {object} returns {totalSupply,reserveA,reserveB}
    */
    async getPoolInfo({
      dispatch,
      rootState: { address: owner },
    }, {
      tokenA, tokenB,
    }) {
      const pair = await dispatch('getPairByTokens', { tokenA, tokenB });
      const { decodedResult: { reserve0, reserve1 } } = await pair.methods.get_reserves(owner);
      const { decodedResult: token0 } = await pair.methods.token0(owner);
      const [reserveA, reserveB] = token0 === tokenA
        ? [reserve0, reserve1]
        : [reserve1, reserve0];
      const { decodedResult: totalSupply } = await pair.methods.total_supply();
      return {
        totalSupply,
        reserveA,
        reserveB,
      };
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
      dispatch,
      state: { router },
    }, {
      token: tokenAddress,
      amount,
    }) {
      const token = await dispatch('getTokenInstance', tokenAddress);
      const routerAddress = getCtAddress(router);
      await token.methods.create_allowance(
        routerAddress,
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

import BigNumber from 'bignumber.js';
import aex9Inteface from 'aeternity-fungible-token/FungibleTokenFull.aes';
import routerInterface from 'dex-contracts-v2/build/IAedexV2Router.aes';
import waeInterface from 'dex-contracts-v2/build/IWAE.aes';
import factoryInteface from 'dex-contracts-v2/build/IAedexV2Factory.aes';
import pairInteface from 'dex-contracts-v2/build/IAedexV2Pair.aes';
import { cttoak, createOnAccountObject } from '../../lib/utils';

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

const genRouterMethodAction = (method, argsMapper) => async (
  context,
  args,
) => {
  const {
    dispatch,
    state: { router },
    rootState: { address, useSdkWallet },
  } = context;
  if (useSdkWallet) {
    const { decodedResult } = await router.methods[method](...argsMapper(context, args));
    return decodedResult;
  }
  const onAccount = createOnAccountObject(address);
  const methodArgs = argsMapper(context, args);
  methodArgs[methodArgs.length - 1] = { ...methodArgs[methodArgs.length - 1], onAccount };
  const { tx } = await router.methods[method].get(...methodArgs);
  window.location = await dispatch('sendTxDeepLinkUrl', tx.encodedTx, { root: true });
  return null;
};

/**
 * adds slippage to a given value
 * @async
 * @param {bigint} value given value
 * @param {bigint} slippage percentage (eg. 10,20...100)
 * @return biging representing final value
*/
const addSlippage = (value, slippage) => value + (value * slippage) / 100n;

/**
 * subtracts slippage from a given value
 * @async
 * @param {bigint} value given value
 * @param {bigint} slippage percentage (eg. 10,20...100)
 * @return biging representing final value
*/
const subSlippage = (value, slippage) => value - (value * slippage) / 100n;

export default {
  namespaced: true,

  state: {
    router: null,
    wae: null,
    factory: null,
    // TODO: should this be the default?
    slippage: 10n,
    pairs: {},
    providedLiquidity: {},
    poolInfo: {},
  },

  mutations: {
    setLiquidity(state, liquidity) {
      state.liquidity = liquidity;
    },
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
    eraseProvidedLiquidity(state) {
      state.providedLiquidity = {};
    },
    updateProvidedLiquidity(state, {
      tokenA, tokenB,
      tokenASymbol, tokenBSymbol,
      tokenADecimals, tokenBDecimals,
      balance,
    }) {
      const [token0, token1] = sortTokens(
        { cid: tokenA, symbol: tokenASymbol, decimals: tokenADecimals },
        { cid: tokenB, symbol: tokenBSymbol, decimals: tokenBDecimals },
        (x) => x.cid,
      );
      state.providedLiquidity[getPairId(tokenA, tokenB)] = balance ? {
        token0, token1, balanceStr: balance.toString(),
      } : undefined;
    },
    updatePoolInfo(state, {
      tokenA, tokenB, reserveA, reserveB, totalSupply,
    }) {
      const [token0, token1] = sortTokens(
        { cid: tokenA, reserve: reserveA },
        { cid: tokenB, reserve: reserveB },
        (x) => x.cid,
      );
      state.poolInfo[getPairId(tokenA, tokenB)] = {
        token0, token1, totalSupply,
      };
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
      const instance = await sdk.getContractInstance(
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
     * @description reset provided liquidity
    */
    resetProvidedLiquidity({
      commit,
    }) {
      commit('eraseProvidedLiquidity');
    },
    /**
     * @description retrieve the liquidity share from a pool
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @return {int | null} returns the owner liquidity
    */
    async pullAccountLiquidity({
      dispatch,
      commit,
      rootState: { address: owner },
    }, {
      tokenA, tokenB,
      tokenASymbol, tokenBSymbol,
      tokenADecimals, tokenBDecimals,
    }) {
      const pair = await dispatch('getPairByTokens', { tokenA, tokenB });

      const { decodedResult: balance } = await pair.methods.balance(owner);
      commit('updateProvidedLiquidity', {
        tokenA,
        tokenB,
        balance,
        tokenASymbol,
        tokenBSymbol,
        tokenADecimals,
        tokenBDecimals,
      });
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
    }, {
      tokenA, tokenB,
    }) {
      const pair = await dispatch('getPairByTokens', { tokenA, tokenB });
      const { decodedResult: { reserve0, reserve1 } } = await pair.methods.get_reserves();
      const { decodedResult: token0 } = await pair.methods.token0();
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
    }, {
      tokenA, tokenB,
      amountA,
    }) {
      const pair = await dispatch('getPairByTokens', { tokenA, tokenB });
      const { decodedResult: { reserve0, reserve1 } } = await pair.methods.get_reserves();
      const { decodedResult: token0 } = await pair.methods.token0();
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
      commit,
    }, {
      tokenA, tokenB,
    }) {
      const pair = await dispatch('getPairByTokens', { tokenA, tokenB });
      const { decodedResult: { reserve0, reserve1 } } = await pair.methods.get_reserves();
      const { decodedResult: token0 } = await pair.methods.token0();
      const [reserveA, reserveB] = token0 === tokenA
        ? [reserve0, reserve1]
        : [reserve1, reserve0];
      const { decodedResult: totalSupply } = await pair.methods.total_supply();

      commit('updatePoolInfo', {
        tokenA,
        tokenB,
        reserveA,
        reserveB,
        totalSupply,
      });
      return {
        totalSupply,
        reserveA,
        reserveB,
      };
    },
    /**
     * @description remove the liquidity provided from a pair
     * of p2.tokenA*p2.tokenB
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
    removeLiquidity: genRouterMethodAction(
      'remove_liquidity',
      ({ state, rootState }, {
        tokenA, tokenB, liquidity, amountADesired, amountBDesired, deadline,
      }) => ([tokenA, tokenB, liquidity,
        subSlippage(amountADesired, state.slippage), // minumum amount to be removed
        subSlippage(amountBDesired, state.slippage), // minumum amount to be removed
        rootState.address, deadline || defaultDeadline(), extraGas]),
    ),

    /**
     * @description remove the liquidity provided from a pair of p2.token*wae
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
    removeLiquidityAe: genRouterMethodAction(
      'remove_liquidity_ae',
      ({ state, rootState }, {
        token, liquidity, amountTokenDesired, amountAEDesired, deadline,
      }) => ([token, liquidity, subSlippage(amountTokenDesired, state.slippage), // minumum removed
        subSlippage(amountAEDesired, state.slippage), // minumum amount to be removed
        rootState.address, deadline || defaultDeadline(), extraGas]),
    ),

    /**
     * @description create allowance for a token AEX9 complient
     * NOTE: the pairs created by the dex-factory are also AEX9 complient
     * @async
     * @param p1 vuex context
     * @param {string} p2.token
     * @param {bigint} p2.amount
    */
    async createTokenAllowance({
      dispatch,
      state: { router, slippage },
      rootState: { address, useSdkWallet },
    }, {
      token: tokenAddress,
      amount,
    }) {
      const token = await dispatch('getTokenInstance', tokenAddress);
      const routerAddress = getCtAddress(router);
      // see first if we have any allowance
      const { decodedResult: currentAllowance } = await token.methods.allowance({
        from_account: address,
        for_account: routerAddress,
      });
      const amountWithSlippage = addSlippage(amount, slippage);
      if (currentAllowance == null) {
        // we don't have any allowance entry, let's create one
        if (useSdkWallet) {
          await token.methods.create_allowance(
            routerAddress,
            amount,
          );
        } else {
          const onAccount = createOnAccountObject(address);
          const { tx } = await token.methods.create_allowance.get(
            routerAddress,
            amount,
            { onAccount },
          );
          window.location = await dispatch('sendTxDeepLinkUrl', tx.encodedTx, { root: true });
        }
      } else if (currentAllowance < amountWithSlippage) {
        // we have something there but is less then
        // what we need, let's increase it
        if (useSdkWallet) {
          await token.methods.change_allowance(
            routerAddress,
            amountWithSlippage - currentAllowance,
          );
        } else {
          const onAccount = createOnAccountObject(address);
          const { tx } = await token.methods.change_allowance.get(
            routerAddress,
            amountWithSlippage - currentAllowance,
            { onAccount },
          );
          window.location = await dispatch('sendTxDeepLinkUrl', tx.encodedTx, { root: true });
        }
      }
      // at this point we are good we have enough allowance
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
    addLiquidity: genRouterMethodAction(
      'add_liquidity',
      ({ state, rootState }, {
        tokenA, tokenB, amountADesired, amountBDesired, minimumLiquidity, deadline,
      }) => ([tokenA, tokenB, amountADesired, amountBDesired,
        subSlippage(amountADesired, state.slippage), subSlippage(amountBDesired, state.slippage),
        rootState.address, minimumLiquidity, deadline || defaultDeadline(), extraGas]),
    ),

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
    addLiquidityAe: genRouterMethodAction(
      'add_liquidity_ae',
      ({ state, rootState }, {
        token, amountTokenDesired, amountAeDesired, minimumLiquidity, deadline,
      }) => ([token, amountTokenDesired, subSlippage(amountTokenDesired, state.slippage),
        subSlippage(amountAeDesired, state.slippage), rootState.address, minimumLiquidity,
        deadline || defaultDeadline(), { ...extraGas, amount: amountAeDesired.toString() }]),
    ),

    async swapExactAeForExactWae({
      dispatch, state: { wae }, rootState: { useSdkWallet, address },
    }, amount) {
      if (useSdkWallet) {
        await wae.methods.deposit({ amount: amount.toString() });
      }
      const onAccount = createOnAccountObject(address);
      const { tx } = await wae.methods.deposit.get({ amount: amount.toString(), onAccount });
      window.location = await dispatch('sendTxDeepLinkUrl', tx.encodedTx, { root: true });
    },
    /**
     * @description swaps WAE to AE token bypassing any dex/router entrypoints
     * @param p1 vuex context
     * @param {bigint} p2.amount exact amount WAE to be transformed into AE
    */
    async swapExactWaeForExactAe({
      dispatch, state: { wae }, rootState: { useSdkWallet, address },
    }, amount) {
      if (useSdkWallet) {
        await wae.methods.withdraw({ amount: amount.toString() });
      }
      const onAccount = createOnAccountObject(address);
      const { tx } = await wae.methods.withdraw.get({ amount: amount.toString(), onAccount });
      window.location = await dispatch('sendTxDeepLinkUrl', tx.encodedTx, { root: true });
    },
    /**
     * @description
     * NOTE: before calling this you should call `path[0].create_allowance`
     * allowing the router to transfer tokens from the first token balance
     * @param p1 vuex context
     * @param {bigint} p2.amountIn exact amount for the token found at path[0]
     * @param {bigint} p2.amountOut desired amount out for the token found at path[n-1]
     * @returns {bigint[]} representing amounts out for every token from the path
    */
    swapExactTokensForTokens: genRouterMethodAction(
      'swap_exact_tokens_for_tokens',
      ({ state, rootState }, {
        amountIn, amountOut, path, deadline,
      }) => ([amountIn, subSlippage(amountOut, state.slippage), path,
        rootState.address, deadline || defaultDeadline(), undefined, extraGas]),
    ),

    /**
     * @description
     * NOTE: before calling this you should call `path[0].create_allowance`
     * allowing the router to transfer tokens from the first token balance
     * @param p1 vuex context
     * @param {bigint} p2.amountOut exact amount for the token found at path[n-1]
     * @param {bigint} p2.amountIn desired amount in for the token found at path[0]
     * @returns {bigint[]} representing amounts in for every token from the path
    */
    swapTokensForExactTokens: genRouterMethodAction(
      'swap_tokens_for_exact_tokens',
      ({ state, rootState }, {
        amountOut, amountIn, path, deadline,
      }) => ([amountOut, addSlippage(amountIn, state.slippage), path,
        rootState.address, deadline || defaultDeadline(), undefined, extraGas]),
    ),

    /**
     * @param p1 vuex context
     * @param {bigint} p2.amountIn exact amount in for the AE found at path[0]
     * @param {bigint} p2.amountOut desired
     * amount out for the token found at path[n-1]
     * @returns {bigint[]} representing amounts out for every token from the path
    */
    swapExactAeForTokens: genRouterMethodAction(
      'swap_exact_ae_for_tokens',
      ({ state, rootState }, {
        amountIn, amountOut, path, deadline,
      }) => ([subSlippage(amountOut, state.slippage), path, rootState.address,
        deadline || defaultDeadline(), undefined, { ...extraGas, amount: amountIn.toString() }]),
    ),

    /**
     * @description
     * NOTE: before calling this you should call `path[0].create_allowance`
     * allowing the router to transfer tokens from the first token balance
     * @param p1 vuex context
     * @param {bigint} p2.amountOut exact amount out for the AE found at path[n-1]
     * @param {bigint} p2.amountIn desired amount in for the token found at path[0]
     * @returns {bigint[]} representing amounts in for every token from the path
    */
    swapTokensForExactAe: genRouterMethodAction(
      'swap_tokens_for_exact_ae',
      ({ state, rootState }, {
        amountOut, amountIn, path, deadline,
      }) => ([amountOut, addSlippage(amountIn, state.slippage), // not more than this
        path, rootState.address, deadline || defaultDeadline(), undefined, extraGas]),
    ),

    /**
     * @description
     * NOTE: before calling this you should call `path[0].create_allowance`
     * allowing the router to transfer tokens from the first token balance
     * @param p1 vuex context
     * @param {bigint} p2.amountIn exact amount in for the token found at path[0]
     * @param {bigint} p2.amountOut desired amount out for the AE found at path[n-1]
     * @returns {bigint[]} representing amounts out for every token from the path
    */
    swapExactTokensForAe: genRouterMethodAction(
      'swap_exact_tokens_for_ae',
      ({ state, rootState }, {
        amountIn, amountOut, path, deadline,
      }) => ([amountIn, subSlippage(amountOut, state.slippage), // no less than this
        path, rootState.address, deadline || defaultDeadline(), undefined, extraGas]),
    ),

    /**
     * @param p1 vuex context
     * @param {bigint} p2.amountOut exact amount out for the token found at path[n-1]
     * @param {bigint} p2.amountIn desired amount in for the AE found at path[0]
     * @returns {bigint[]} representing amounts in for every token from the path
    */
    swapAeForExactTokens: genRouterMethodAction(
      'swap_ae_for_exact_tokens',
      ({ state, rootState }, {
        amountIn, amountOut, path, deadline,
      }) => ([amountOut, path, rootState.address, deadline || defaultDeadline(), undefined,
        { ...extraGas, amount: addSlippage(amountIn, state.slippage).toString() }]),
      // this is the diff between the desired+slippage and
      // the actual amount will be return into owner's wallet
    ),
  },
};

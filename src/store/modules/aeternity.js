import BigNumber from 'bignumber.js';
import aex9Inteface from 'aeternity-fungible-token/FungibleTokenFull.aes';
import routerInterface from 'dex-contracts-v2/build/IAedexV2Router.aes';
import waeInterface from 'dex-contracts-v2/build/IWAE.aes';
import factoryInteface from 'dex-contracts-v2/build/IAedexV2Factory.aes';
import pairInteface from 'dex-contracts-v2/build/IAedexV2Pair.aes';
import {
  cttoak, createOnAccountObject, addSlippage, subSlippage,
} from '../../lib/utils';
import {
  DEFAULT_SLIPPAGE, MIN_SLIPPAGE, MAX_SLIPPAGE,
  DEFAULT_DEADLINE, MIN_DEADLINE, MAX_DEADLINE,
} from '../../lib/constants';

const calculateDeadline = (deadline) => Date.now() + deadline * 60000;

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
export const getPairId = (tokenA, tokenB) => {
  const [token0, token1] = sortTokens(tokenA, tokenB);
  return `${token0}|${token1}`;
};

const extraOpts = {
  // TODO: remove this after testing the actual gas and before production
  gas: 150000,
  // TODO: this is added because of the 'unknown event' related error,
  // after investigation a decision should be made
  omitUnknown: true,
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
    const result = await router.methods[method](...argsMapper(context, args));
    return result;
  }

  const methodArgs = argsMapper(context, args);
  methodArgs[methodArgs.length - 1] = {
    ...methodArgs[methodArgs.length - 1],
    onAccount: address,
  };
  const result = await router.methods[method].get(...methodArgs);
  window.location = await dispatch('sendTxDeepLinkUrl', result.tx.encodedTx, { root: true });
  return result;
};

export default {
  namespaced: true,

  state: {
    router: null,
    wae: null,
    factory: null,
    slippage: DEFAULT_SLIPPAGE, // percentage with 1 digit after separator
    deadline: DEFAULT_DEADLINE, // minutes with 1 digit after separator
    pairs: {},
    providedLiquidity: {},
    poolInfo: {},
    fetchingPairInfo: false,
  },

  mutations: {
    setFetchingPairInfo(state, status) {
      state.fetchingPairInfo = status;
    },
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
      state.slippage = slippage > MIN_SLIPPAGE && slippage < MAX_SLIPPAGE
        ? (+slippage).toFixed(1) : DEFAULT_SLIPPAGE;
    },
    setDeadline(state, deadline) {
      state.deadline = deadline > MIN_DEADLINE && deadline < MAX_DEADLINE
        ? (+deadline).toFixed(1) : DEFAULT_DEADLINE;
    },
    addPair(state, { tokenA, tokenB, instance }) {
      state.pairs[getPairId(tokenA, tokenB)] = instance;
    },
    eraseProvidedLiquidity(state, { address }) {
      state.providedLiquidity[address] = {};
    },
    updateProvidedLiquidity(state, {
      tokenA, tokenB,
      tokenASymbol, tokenBSymbol,
      tokenADecimals, tokenBDecimals,
      balance,
      address,
    }) {
      const [token0, token1] = sortTokens(
        { cid: tokenA, symbol: tokenASymbol, decimals: tokenADecimals },
        { cid: tokenB, symbol: tokenBSymbol, decimals: tokenBDecimals },
        (x) => x.cid,
      );
      if (!state.providedLiquidity[address]) {
        state.providedLiquidity[address] = {};
      }
      state.providedLiquidity[address][getPairId(tokenA, tokenB)] = balance ? {
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
    async init({ dispatch }) {
      await dispatch('initRouter');
      await dispatch('initFactory');
      await dispatch('initWae');
    },
    async initRouter({ commit, rootState: { sdk }, rootGetters: { activeNetwork } }) {
      if (activeNetwork) {
        const contract = await sdk.getContractInstance(
          {
            source: routerInterface,
            contractAddress: activeNetwork.routerAddress,
          },
        );
        commit('setRouterInstance', contract);
      }
    },
    async initFactory({ commit, state: { router }, rootState: { sdk } }) {
      const { decodedResult: factoryAddress } = await router.methods.factory();
      const contract = await sdk.getContractInstance(
        {
          source: factoryInteface,
          contractAddress: factoryAddress,
        },
      );
      commit('setFactoryInstance', contract);
    },
    async initWae({ commit, rootState: { sdk }, rootGetters: { activeNetwork } }) {
      if (activeNetwork) {
        const contract = await sdk.getContractInstance(
          {
            source: waeInterface,
            contractAddress: activeNetwork.waeAddress,
          },
        );
        commit('setWaeInstance', contract);
      }
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
    async getTokenInstanceMetaInfo({ dispatch }, contractAddress) {
      const contractInstance = await dispatch('getTokenInstance', contractAddress);
      const metaInfo = await contractInstance.methods.meta_info();
      return metaInfo;
    },
    /**
     * @description reset provided liquidity
    */
    resetProvidedLiquidity({
      commit,
      rootState: { address },
    }) {
      if (address) {
        commit('eraseProvidedLiquidity', { address });
      }
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
      rootState: { address },
    }, {
      tokenA, tokenB,
      tokenASymbol, tokenBSymbol,
      tokenADecimals, tokenBDecimals,
    }) {
      const pair = await dispatch('getPairByTokens', { tokenA, tokenB });

      const { decodedResult: balance } = await pair.methods.balance(address);
      commit('updateProvidedLiquidity', {
        tokenA,
        tokenB,
        balance,
        tokenASymbol,
        tokenBSymbol,
        tokenADecimals,
        tokenBDecimals,
        address,
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
     * @description fetches the pool info and updates it into the store
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @return {object} returns {totalSupply,reserveA,reserveB}
    */
    async fetchPoolInfo({
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
     * @description get info about the pool
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @return {object} returns [totalSupply,reserveA,reserveB] or []
     * when no pair
    */
    async getPairInfo({
      dispatch, commit, state: { factory }, rootGetters: { activeNetwork },
    }, { tokenA, tokenB }) {
      try {
        if (!tokenA || !tokenB || !factory || !activeNetwork) {
          return [];
        }

        if (
          tokenA.contract_id === activeNetwork.waeAddress
          && tokenB.contract_id === activeNetwork.waeAddress
        ) {
          return [0, 1, 1];
        }
        commit('setFetchingPairInfo', true);

        const { totalSupply, reserveA, reserveB } = await dispatch('fetchPoolInfo', {
          tokenA: tokenA.contract_id,
          tokenB: tokenB.contract_id,
        });
        commit('setFetchingPairInfo', false);

        return [totalSupply, reserveA, reserveB];
      } catch (e) {
        commit('setFetchingPairInfo', false);
        if (e.message !== 'PAIR NOT FOUND') {
          throw e;
        }
        return [];
      }
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
     * @return {Promise<[bigint,bigint]>}
     * amounts removed for tokenA and tokenB
    */
    removeLiquidity: genRouterMethodAction(
      'remove_liquidity',
      ({ state, rootState }, {
        tokenA, tokenB, liquidity, amountADesired, amountBDesired,
      }) => ([tokenA, tokenB, liquidity,
        subSlippage(amountADesired, state.slippage), // min received tokenA after the removal
        subSlippage(amountBDesired, state.slippage), // min received tokenB after the removal
        rootState.address, calculateDeadline(state.deadline), extraOpts]),
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
     * @return {Promise<[bigint,bigint]>}
     * amounts removed for token and wae
    */
    removeLiquidityAe: genRouterMethodAction(
      'remove_liquidity_ae',
      ({ state, rootState }, {
        token, liquidity, amountTokenDesired, amountAEDesired,
      }) => ([token, liquidity,
        subSlippage(amountTokenDesired, state.slippage), // min received Token after the removal
        subSlippage(amountAEDesired, state.slippage), // min received AE after the removal
        rootState.address, calculateDeadline(state.deadline), extraOpts]),
    ),

    /**
     * @description getting the allowance for a certain contract
     * @async
     * @param p1 vuex context
     * @param {Object} p2.instance the token (AEX9) instance
     * @param {string} p2.toAccount allowance destination address
     * @returns {bigint} the allowance amount or 0n even in the case when
     * no allowance was created
    */
    async getAllowance({
      rootState: { address },
    }, {
      instance,
      toAccount,
    }) {
      const { decodedResult: currentAllowance } = await instance.methods.allowance({
        from_account: address,
        for_account: toAccount,
      });
      return currentAllowance ?? 0n;
    },

    /**
     * @description getting the router allowance for a Token
     * @async
     * @param p1 vuex context
     * @param {string} p2.token
     * @returns {bigint} the allowance amount or 0n even in the case when
     * no allowance was created
    */
    async getRouterTokenAllowance({
      dispatch,
      state: { router },
    }, {
      token: tokenAddress,
    }) {
      return dispatch('getAllowance', {
        instance: await dispatch('getTokenInstance', tokenAddress),
        toAccount: getCtAddress(router),
      });
    },

    /**
     * @description getting the router allowance for a Pair
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @returns {bigint} the allowance amount or 0n even in the case when
     * no allowance was created
    */
    async getRouterPairAllowance({
      dispatch,
      state: { router },
    }, {
      tokenA,
      tokenB,
    }) {
      return dispatch('getAllowance', {
        instance: await dispatch('getPairByTokens', { tokenA, tokenB }),
        toAccount: getCtAddress(router),
      });
    },

    /**
     * @description create allowance for a token AEX9 compliant
     * NOTE:
     * 1. the pairs created by the dex-factory are also AEX9 compliant
     * 2. to be used internally with createTokenAllowance
     * or createPairAllowance
     * @async
     * @param p1 vuex context
     * @param {Object} p2.instance the token instance
     * @param {string} p2.toAccount allowance destination address
     * @param {bigint} p2.amount
    */
    async createAllowance({
      dispatch,
      state: { slippage },
      rootState: { address, useSdkWallet },
    }, {
      instance,
      toAccount,
      amount,
    }) {
      // see first if we have any allowance
      const { decodedResult: currentAllowance } = await instance.methods.allowance({
        from_account: address,
        for_account: toAccount,
      });

      const amountWithSlippage = addSlippage(amount, slippage);
      if (currentAllowance == null) {
        // we don't have any allowance entry, let's create one
        if (useSdkWallet) {
          await instance.methods.create_allowance(
            toAccount,
            amountWithSlippage,
          );
        } else {
          const onAccount = createOnAccountObject(address);
          const { tx } = await instance.methods.create_allowance.get(
            toAccount,
            amount,
            { onAccount },
          );
          window.location = await dispatch('sendTxDeepLinkUrl', tx.encodedTx, { root: true });
        }
      } else if (currentAllowance < amountWithSlippage) {
        // we have something there but is less then
        // what we need, let's increase it
        if (useSdkWallet) {
          await instance.methods.change_allowance(
            toAccount,
            amountWithSlippage - currentAllowance,
          );
        } else {
          const onAccount = createOnAccountObject(address);
          const { tx } = await instance.methods.change_allowance.get(
            toAccount,
            amountWithSlippage - currentAllowance,
            { onAccount },
          );
          window.location = await dispatch('sendTxDeepLinkUrl', tx.encodedTx, { root: true });
        }
      }
      // at this point we are good, we have enough allowance
    },

    /**
     * @description create allowance for a token AEX9 compliant
     * @async
     * @param p1 vuex context
     * @param {string} p2.token
     * @param {bigint} p2.amount
    */
    async createTokenAllowance({
      dispatch,
      state: { router },
    }, {
      token: tokenAddress,
      amount,
    }) {
      await dispatch('createAllowance', {
        instance: await dispatch('getTokenInstance', tokenAddress),
        toAccount: getCtAddress(router),
        amount,
      });
    },

    /**
     * @description create allowance for tokens owned in a Pair
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @param {bigint} p2.amount
    */
    async createPairAllowance({
      dispatch,
      state: { router },
    }, {
      tokenA,
      tokenB,
      amount,
    }) {
      await dispatch('createAllowance', {
        instance: await dispatch('getPairByTokens', { tokenA, tokenB }),
        toAccount: getCtAddress(router),
        amount,
      });
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
     * @return {Promise<[bigint,bigint,liquidity]>}
     * amounts transfered for tokenA and tokenB and the liquidity
    */
    addLiquidity: genRouterMethodAction(
      'add_liquidity',
      ({ state, rootState }, {
        tokenA, tokenB, amountADesired, amountBDesired, minimumLiquidity,
      }) => ([tokenA, tokenB, amountADesired, amountBDesired,
        subSlippage(amountADesired, state.slippage), // min token A amount received
        subSlippage(amountBDesired, state.slippage), // min token B amount received
        rootState.address, minimumLiquidity, calculateDeadline(state.deadline), extraOpts]),
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
     * @param {bigint} p2.minimumLiquidity if the pair was not created at
     * the point of creation the factory needs the minimum liquidity value
     * @return {Promise<[bigint,bigint,liquidity]>}
     * amounts transfered for token and AE and the liquidity
    */
    addLiquidityAe: genRouterMethodAction(
      'add_liquidity_ae',
      ({ state, rootState }, {
        token, amountTokenDesired, amountAeDesired, minimumLiquidity,
      }) => ([token, amountTokenDesired,
        subSlippage(amountTokenDesired, state.slippage), // min token amount received
        subSlippage(amountAeDesired, state.slippage), // min AE amount received
        rootState.address, minimumLiquidity,
        calculateDeadline(state.deadline), {
          ...extraOpts,
          amount: amountAeDesired.toString(), // if less is added the diff is returned at the end
        }]),
    ),

    async swapExactAeForExactWae({
      dispatch, state: { wae }, rootState: { useSdkWallet, address },
    }, amount) {
      if (useSdkWallet) {
        return wae.methods.deposit({ amount: amount.toString() });
      }
      const onAccount = createOnAccountObject(address);
      const result = await wae.methods.deposit.get({ amount: amount.toString(), onAccount });
      window.location = await dispatch('sendTxDeepLinkUrl', result.tx.encodedTx, { root: true });
      return result;
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
        return wae.methods.withdraw(amount);
      }
      const onAccount = createOnAccountObject(address);
      const result = await wae.methods.withdraw.get({ amount: amount.toString(), onAccount });
      window.location = await dispatch('sendTxDeepLinkUrl', result.tx.encodedTx, { root: true });
      return result;
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
        amountIn, amountOut, path,
      }) => ([amountIn, subSlippage(amountOut, state.slippage), path,
        rootState.address, calculateDeadline(state.deadline), undefined, extraOpts]),
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
        amountOut, amountIn, path,
      }) => ([amountOut, addSlippage(amountIn, state.slippage), path,
        rootState.address, calculateDeadline(state.deadline), undefined, extraOpts]),
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
        amountIn, amountOut, path,
      }) => ([subSlippage(amountOut, state.slippage), path, rootState.address,
        calculateDeadline(state.deadline),
        undefined, { ...extraOpts, amount: amountIn.toString() }]),
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
        amountOut, amountIn, path,
      }) => ([amountOut, addSlippage(amountIn, state.slippage), // not more than this
        path, rootState.address, calculateDeadline(state.deadline), undefined, extraOpts]),
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
        amountIn, amountOut, path,
      }) => ([amountIn, subSlippage(amountOut, state.slippage), // no less than this
        path, rootState.address, calculateDeadline(state.deadline), undefined, extraOpts]),
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
        amountIn, amountOut, path,
      }) => ([amountOut, path, rootState.address, calculateDeadline(state.deadline),
        undefined, {
          ...extraOpts,
          // this is the diff between the desired+slippage and
          // the actual amount will be return into owner's wallet
          amount: addSlippage(amountIn, state.slippage).toString(),
        }]),
    ),
  },
};

import aex9ACI from 'dex-contracts-v2/build/FungibleTokenFull.aci.json';
import routerACI from 'dex-contracts-v2/build/AedexV2Router.aci.json';
import waeACI from 'dex-contracts-v2/build/WAE.aci.json';
import factoryACI from 'dex-contracts-v2/build/AedexV2Factory.aci.json';
import pairACI from 'dex-contracts-v2/build/AedexV2Pair.aci.json';
import {
  cttoak,
  createOnAccountObject,
  addSlippage,
  subSlippage,
  getPairId,
  sortTokens,
  isDexBackendDisabled,
} from '@/lib/utils';
import {
  DEFAULT_SLIPPAGE,
  MIN_SLIPPAGE,
  MAX_SLIPPAGE,
  DEFAULT_DEADLINE,
  MIN_DEADLINE,
  MAX_DEADLINE,
} from '@/lib/constants';
import i18n from '@/i18n';

const calculateDeadline = (deadline) => Date.now() + deadline * 60000;

const getAddress = (x) => x.$options.address;
const getCtAddress = (contract) => cttoak(getAddress(contract));
const logDryRunAlternative = async (actionName, args) => {
  const logDryRun = import.meta.env.VITE_DEBUG_LOG_DRY_RUN_ALTERNATIVE;
  if (!isDexBackendDisabled && parseInt(logDryRun || '0', 10)) {
    console.warn(`Going with dry-run alternative for: ${actionName}(${JSON.stringify(args)})`);
  }
};

const extraOpts = {
  // TODO: remove this after testing the actual gas and before production
  gas: 150000,
  // TODO: this is added because of the 'unknown event' related error,
  // after investigation a decision should be made
  omitUnknown: true,
};

const genRouterWaeMethodAction =
  (method, argsMapper, isWae = false) =>
  async (context, { transactionInfo = null, ...args }) => {
    const {
      dispatch,
      commit,
      state: { router, wae },
      rootState: { address, useSdkWallet },
    } = context;
    const methodArgs = argsMapper(context, args);
    methodArgs[methodArgs.length - 1] = {
      ...methodArgs[methodArgs.length - 1],
      ...(useSdkWallet
        ? { waitMined: false }
        : {
            callStatic: true,
            onAccount: createOnAccountObject(address),
          }),
    };
    if (useSdkWallet) {
      const result = await (isWae ? wae : router)[method](...methodArgs);
      commit(
        'addTransaction',
        { hash: result.hash, info: transactionInfo, pending: true },
        { root: true },
      );
      return result;
    }
    const result = await (isWae ? wae : router)[method](...methodArgs);
    const builded = result.rawTx;
    commit(
      'addTransaction',
      {
        txParams: result.tx,
        info: transactionInfo,
        pending: true,
        unfinished: true,
      },
      { root: true },
    );
    window.location = await dispatch('sendTxDeepLinkUrl', builded, { root: true });
    return result;
  };
const withFetchingPairInfo = (work) => async (context, args) => {
  const { commit } = context;
  // fetching through dex-backend could be so fast
  // that the visual effect of `fetching pair indicator`
  // is just an unpleasant flickering. In this case delaying it
  // with a few hundreds of ms is doing the job
  const timeoutId = setTimeout(() => commit('setFetchingPairInfo', true), 100);
  try {
    return await work(context, args);
  } finally {
    clearTimeout(timeoutId);
    commit('setFetchingPairInfo', false);
  }
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
    routes: {},
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
      state.slippage =
        slippage > MIN_SLIPPAGE && slippage < MAX_SLIPPAGE
          ? (+slippage).toFixed(1)
          : DEFAULT_SLIPPAGE;
    },
    setDeadline(state, deadline) {
      state.deadline =
        deadline > MIN_DEADLINE && deadline < MAX_DEADLINE
          ? (+deadline).toFixed(1)
          : DEFAULT_DEADLINE;
    },
    addPair(state, { tokenA, tokenB, instance }) {
      state.pairs[getPairId(tokenA, tokenB)] = instance;
    },
    eraseProvidedLiquidity(state, { address }) {
      state.providedLiquidity[address] = {};
    },
    updateProvidedLiquidity(
      state,
      {
        tokenA,
        tokenB,
        tokenASymbol,
        tokenBSymbol,
        tokenADecimals,
        tokenBDecimals,
        balance,
        address,
        networkId,
      },
    ) {
      const [token0, token1] = sortTokens(
        { contract_id: tokenA, symbol: tokenASymbol, decimals: tokenADecimals },
        { contract_id: tokenB, symbol: tokenBSymbol, decimals: tokenBDecimals },
        (x) => x.contract_id,
      );
      if (!state.providedLiquidity[address]) {
        state.providedLiquidity[address] = {};
      }
      state.providedLiquidity[address][getPairId(tokenA, tokenB)] = balance
        ? {
            token0,
            token1,
            balanceStr: balance.toString(),
            networkId,
          }
        : undefined;
    },
    updatePoolInfo(state, { tokenA, tokenB, reserveA, reserveB, totalSupply }) {
      const [token0, token1] = sortTokens(
        { contract_id: tokenA, reserve: reserveA },
        { contract_id: tokenB, reserve: reserveB },
        (x) => x.contract_id,
      );
      state.poolInfo[getPairId(tokenA, tokenB)] = {
        token0,
        token1,
        totalSupply,
      };
    },
    updateRoutes(state, { tokenA, tokenB, routes }) {
      state.routes[getPairId(tokenA, tokenB)] = routes;
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
        const contract = await sdk.initializeContract({
          aci: routerACI,
          address: activeNetwork.routerAddress,
        });
        commit('setRouterInstance', Object.freeze(contract));
      }
    },
    async initFactory({ commit, state: { router }, rootState: { sdk } }) {
      const { decodedResult: factoryAddress } = await router.factory();
      const contract = await sdk.initializeContract({
        aci: factoryACI,
        address: factoryAddress,
      });
      commit('setFactoryInstance', contract);
    },
    async initWae({ commit, rootState: { sdk }, rootGetters: { activeNetwork } }) {
      if (activeNetwork) {
        const contract = await sdk.initializeContract({
          aci: waeACI,
          address: activeNetwork.waeAddress,
        });
        commit('setWaeInstance', Object.freeze(contract));
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
    async getPairByTokens(
      { commit, state: { factory, pairs }, rootState: { sdk }, rootGetters },
      { tokenA, tokenB },
    ) {
      const pair = pairs[getPairId(tokenA, tokenB)];
      if (pair) return pair;

      const getter = 'backend/getPairInfo';
      const args = { tokenA, tokenB };
      // get faster pair address from backend module
      let contractAddress = rootGetters[getter](args)?.address;
      if (!contractAddress) {
        logDryRunAlternative(getter, args);
        // if backend module isn't successfully initialized or pair
        // wasn't found for any reason let's try also getting it through
        // a dry-run sdk call
        contractAddress = (await factory.get_pair(tokenA, tokenB)).decodedResult;
      }

      if (contractAddress == null) {
        throw new Error('PAIR NOT FOUND');
      }
      const instance = await sdk.initializeContract({
        aci: pairACI,
        address: contractAddress,
      });
      commit('addPair', { tokenA, tokenB, instance });
      return instance;
    },
    getTokenInstance({ rootState: { sdk } }, contractAddress) {
      return sdk.initializeContract({
        aci: aex9ACI,
        address: contractAddress,
      });
    },
    async getTokenInstanceMetaInfo({ dispatch }, contractAddress) {
      const contractInstance = await dispatch('getTokenInstance', contractAddress);
      const metaInfo = await contractInstance.meta_info();
      return metaInfo;
    },
    /**
     * @description reset provided liquidity
     */
    resetProvidedLiquidity({ commit, rootState: { address } }) {
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
    async pullAccountLiquidity(
      { dispatch, commit, rootState: { address }, rootGetters: { activeNetwork } },
      { tokenA, tokenB, tokenASymbol, tokenBSymbol, tokenADecimals, tokenBDecimals },
    ) {
      if (!activeNetwork) return null;
      const pair = await dispatch('getPairByTokens', { tokenA, tokenB });

      const { decodedResult: balance } = await pair.balance(address);
      commit('updateProvidedLiquidity', {
        tokenA,
        tokenB,
        balance,
        tokenASymbol,
        tokenBSymbol,
        tokenADecimals,
        tokenBDecimals,
        address,
        networkId: activeNetwork.networkId,
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
      const { decodedResult: totalSupply } = await pair.total_supply();
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
    async getRate({ dispatch }, { tokenA, tokenB }) {
      const pair = await dispatch('getPairByTokens', { tokenA, tokenB });
      const {
        decodedResult: { reserve0, reserve1 },
      } = await pair.get_reserves();
      const { decodedResult: token0 } = await pair.token0();
      const [reserveA, reserveB] = token0 === tokenA ? [reserve0, reserve1] : [reserve1, reserve0];
      return reserveA / reserveB;
    },
    /**
     * @description fetches the pool info and updates it into the store
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @return {object} returns {totalSupply,reserveA,reserveB}
     */
    async fetchPoolInfo({ dispatch, commit }, { tokenA, tokenB }) {
      // get faster pair address from backend module

      const action = 'backend/fetchPairDetails';
      const args = { tokenA, tokenB };
      const resp = await dispatch(action, args, { root: true });

      let [totalSupply, reserveA, reserveB] = [];

      const assignReserves = ({ reserve0, reserve1, token0 }) => {
        [reserveA, reserveB] = token0 === tokenA ? [reserve0, reserve1] : [reserve1, reserve0];
      };

      if (resp && resp.synchronized && resp.liquidityInfo) {
        totalSupply = resp.liquidityInfo.totalSupply;
        assignReserves({ ...resp.liquidityInfo, token0: resp.token0.address });
      } else {
        // if for any reason backend module isn't successfully
        // returning synchronized values or no values at all
        // let's try a dry-run as well
        logDryRunAlternative(action, args);
        const pair = await dispatch('getPairByTokens', { tokenA, tokenB });
        assignReserves({
          ...(await pair.get_reserves()).decodedResult,
          token0: (await pair.token0()).decodedResult,
        });
        totalSupply = (await pair.total_supply()).decodedResult;
      }

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
     * @description fetches all short swap routes between two tokens
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @return {Array} returns the all the routes
     */
    fetchSwapRoutes: withFetchingPairInfo(async ({ dispatch, commit }, { tokenA, tokenB }) => {
      const sortedTokens = sortTokens(tokenA, tokenB);
      const action = 'backend/fetchSwapRoutes';
      // we ask always for the same order of t0/t1 swap-routes
      // to remain consistent into `this.routes[getPairId(ta,tb)]`
      const args = {
        tokenA: sortedTokens[0],
        tokenB: sortedTokens[1],
      };
      const resp = await dispatch(action, args, { root: true });
      let routes = resp
        ?.filter((pairs) => pairs.every((pair) => pair.synchronized))
        .map((pairs) =>
          pairs.map((pair) => ({
            ...pair,
            liquidityInfo: {
              ...pair.liquidityInfo.height,
              totalSupply: BigInt(pair.liquidityInfo.totalSupply),
              reserve0: BigInt(pair.liquidityInfo.reserve0),
              reserve1: BigInt(pair.liquidityInfo.reserve1),
            },
          })),
        );

      // if for any reason backend module isn't successfully
      // returning synchronized values
      // let's try a dry-run instead
      if (!routes?.length) {
        logDryRunAlternative(action, args);
        const pair = await dispatch('getPairByTokens', { tokenA, tokenB });
        const {
          decodedResult: { reserve0, reserve1 },
        } = await pair.get_reserves();
        const { decodedResult: token0 } = await pair.token0();
        const {
          decodedResult: totalSupply,
          result: { height },
        } = await pair.total_supply();
        const pairAddress = getAddress(pair);
        routes = [
          [
            {
              address: pairAddress,
              token0,
              token1: token0 === tokenA ? tokenB : tokenA,
              synchronized: 'dry-run',
              liquidityInfo: {
                totalSupply,
                reserve0,
                reserve1,
                height,
              },
            },
          ],
        ];
      }

      commit('updateRoutes', {
        tokenA,
        tokenB,
        routes,
      });
      return routes;
    }),

    /**
     * @description get info about the pool
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA address
     * @param {string} p2.tokenB tokenA address
     * @return {object} returns [totalSupply,reserveA,reserveB] or []
     * when no pair
     */
    getPairInfo: withFetchingPairInfo(
      async ({ dispatch, rootGetters: { activeNetwork } }, { tokenA, tokenB }) => {
        try {
          if (!tokenA || !tokenB || !activeNetwork) {
            return [];
          }

          if (
            tokenA.contract_id === activeNetwork.waeAddress &&
            tokenB.contract_id === activeNetwork.waeAddress
          ) {
            return [0, 1, 1];
          }
          const { totalSupply, reserveA, reserveB } = await dispatch('fetchPoolInfo', {
            tokenA: tokenA.contract_id,
            tokenB: tokenB.contract_id,
          });
          return [totalSupply, reserveA, reserveB];
        } catch (e) {
          if (e.message !== 'PAIR NOT FOUND') {
            throw e;
          }
          return [];
        }
      },
    ),
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
    removeLiquidity: genRouterWaeMethodAction(
      'remove_liquidity',
      ({ state, rootState }, { tokenA, tokenB, liquidity, amountADesired, amountBDesired }) => [
        tokenA,
        tokenB,
        liquidity,
        subSlippage(amountADesired, state.slippage), // min received tokenA after the removal
        subSlippage(amountBDesired, state.slippage), // min received tokenB after the removal
        rootState.address,
        calculateDeadline(state.deadline),
        extraOpts,
      ],
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
    removeLiquidityAe: genRouterWaeMethodAction(
      'remove_liquidity_ae',
      ({ state, rootState }, { token, liquidity, amountTokenDesired, amountAEDesired }) => [
        token,
        liquidity,
        subSlippage(amountTokenDesired, state.slippage), // min received Token after the removal
        subSlippage(amountAEDesired, state.slippage), // min received AE after the removal
        rootState.address,
        calculateDeadline(state.deadline),
        extraOpts,
      ],
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
    async getAllowance({ rootState: { address } }, { instance, toAccount }) {
      const { decodedResult: currentAllowance } = await instance.allowance({
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
    async getRouterTokenAllowance({ dispatch, state: { router } }, { token: tokenAddress }) {
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
    async getRouterPairAllowance({ dispatch, state: { router } }, { tokenA, tokenB }) {
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
    async createAllowance(
      { dispatch, commit, state: { slippage }, rootState: { address, useSdkWallet } },
      { instance, toAccount, amount, transactionInfo },
    ) {
      // see first if we have any allowance
      const { decodedResult: currentAllowance } = await instance.allowance({
        from_account: address,
        for_account: toAccount,
      });

      const amountWithSlippage = addSlippage(amount, slippage);
      if (currentAllowance == null) {
        // we don't have any allowance entry, let's create one
        if (useSdkWallet) {
          return instance.create_allowance(toAccount, amountWithSlippage);
        }
        const onAccount = createOnAccountObject(address);
        const { tx } = await instance.create_allowance(toAccount, amountWithSlippage, {
          onAccount,
        });
        commit(
          'addTransaction',
          {
            txParams: tx.params,
            info: transactionInfo,
            pending: true,
            unfinished: true,
          },
          { root: true },
        );
        window.location = await dispatch('sendTxDeepLinkUrl', tx.encodedTx, { root: true });
      } else if (currentAllowance < amountWithSlippage) {
        // we have something there but is less then
        // what we need, let's increase it
        if (useSdkWallet) {
          return instance.change_allowance(toAccount, amountWithSlippage - currentAllowance);
        }
        const onAccount = createOnAccountObject(address);
        const { tx, rawTx: builded } = await instance.change_allowance(
          toAccount,
          amountWithSlippage - currentAllowance,
          { onAccount, callStatic: true },
        );
        commit(
          'addTransaction',
          {
            txParams: tx,
            info: transactionInfo,
            pending: true,
            unfinished: true,
          },
          { root: true },
        );
        window.location = await dispatch('sendTxDeepLinkUrl', builded, { root: true });
      }
      // at this point we are good, we have enough allowance
      return null;
    },

    /**
     * @description create allowance for a token AEX9 compliant
     * @async
     * @param p1 vuex context
     * @param {string} p2.token
     * @param {bigint} p2.amount
     */
    async createTokenAllowance({ dispatch, commit, state: { router } }, { token, amount }) {
      const result = await dispatch('createAllowance', {
        instance: await dispatch('getTokenInstance', token.contract_id),
        toAccount: getCtAddress(router),
        amount,
        transactionInfo: `${i18n.global.t('approve')} ${token.symbol}`,
      });
      if (result) {
        commit(
          'addTransaction',
          { hash: result.hash, info: `${i18n.global.t('approve')} ${token.symbol}`, pending: true },
          { root: true },
        );
      }
    },

    /**
     * @description create allowance for tokens owned in a Pair
     * @async
     * @param p1 vuex context
     * @param {string} p2.tokenA tokenA
     * @param {string} p2.tokenB tokenB
     * @param {bigint} p2.amount
     */
    async createPairAllowance({ dispatch, commit, state: { router } }, { tokenA, tokenB, amount }) {
      const result = await dispatch('createAllowance', {
        instance: await dispatch('getPairByTokens', {
          tokenA: tokenA.contract_id,
          tokenB: tokenB.contract_id,
        }),
        toAccount: getCtAddress(router),
        amount,
        transactionInfo: `${i18n.global.t('approve')} ${tokenA.symbol}/${tokenB.symbol}`,
      });
      if (result) {
        commit(
          'addTransaction',
          {
            hash: result.hash,
            info: `${i18n.global.t('approve')} ${tokenA.symbol}/${tokenB.symbol}`,
            pending: true,
          },
          { root: true },
        );
      }
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
    addLiquidity: genRouterWaeMethodAction(
      'add_liquidity',
      (
        { state, rootState },
        { tokenA, tokenB, amountADesired, amountBDesired, minimumLiquidity },
      ) => [
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        subSlippage(amountADesired, state.slippage), // min token A amount received
        subSlippage(amountBDesired, state.slippage), // min token B amount received
        rootState.address,
        minimumLiquidity,
        calculateDeadline(state.deadline),
        extraOpts,
      ],
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
    addLiquidityAe: genRouterWaeMethodAction(
      'add_liquidity_ae',
      ({ state, rootState }, { token, amountTokenDesired, amountAeDesired, minimumLiquidity }) => [
        token,
        amountTokenDesired,
        subSlippage(amountTokenDesired, state.slippage), // min token amount received
        subSlippage(amountAeDesired, state.slippage), // min AE amount received
        rootState.address,
        minimumLiquidity,
        calculateDeadline(state.deadline),
        {
          ...extraOpts,
          amount: amountAeDesired.toString(), // if less is added the diff is returned at the end
        },
      ],
    ),

    swapExactAeForExactWae: genRouterWaeMethodAction(
      'deposit',
      (_, { amount }) => [{ amount: amount.toString() }],
      true,
    ),

    /**
     * @description swaps WAE to AE token bypassing any dex/router entrypoints
     * @param p1 vuex context
     * @param {bigint} p2.amount exact amount WAE to be transformed into AE
     */
    swapExactWaeForExactAe: genRouterWaeMethodAction(
      'withdraw',
      (_, { amount }) => [amount, null],
      true,
    ),

    /**
     * @description
     * NOTE: before calling this you should call `path[0].create_allowance`
     * allowing the router to transfer tokens from the first token balance
     * @param p1 vuex context
     * @param {bigint} p2.amountIn exact amount for the token found at path[0]
     * @param {bigint} p2.amountOut desired amount out for the token found at path[n-1]
     * @returns {bigint[]} representing amounts out for every token from the path
     */
    swapExactTokensForTokens: genRouterWaeMethodAction(
      'swap_exact_tokens_for_tokens',
      ({ state, rootState }, { amountIn, amountOut, path }) => [
        amountIn,
        subSlippage(amountOut, state.slippage),
        path,
        rootState.address,
        calculateDeadline(state.deadline),
        undefined,
        extraOpts,
      ],
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
    swapTokensForExactTokens: genRouterWaeMethodAction(
      'swap_tokens_for_exact_tokens',
      ({ state, rootState }, { amountOut, amountIn, path }) => [
        amountOut,
        addSlippage(amountIn, state.slippage),
        path,
        rootState.address,
        calculateDeadline(state.deadline),
        undefined,
        extraOpts,
      ],
    ),

    /**
     * @param p1 vuex context
     * @param {bigint} p2.amountIn exact amount in for the AE found at path[0]
     * @param {bigint} p2.amountOut desired
     * amount out for the token found at path[n-1]
     * @returns {bigint[]} representing amounts out for every token from the path
     */
    swapExactAeForTokens: genRouterWaeMethodAction(
      'swap_exact_ae_for_tokens',
      ({ state, rootState }, { amountIn, amountOut, path }) => [
        subSlippage(amountOut, state.slippage),
        path,
        rootState.address,
        calculateDeadline(state.deadline),
        undefined,
        { ...extraOpts, amount: amountIn.toString() },
      ],
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
    swapTokensForExactAe: genRouterWaeMethodAction(
      'swap_tokens_for_exact_ae',
      ({ state, rootState }, { amountOut, amountIn, path }) => [
        amountOut,
        addSlippage(amountIn, state.slippage), // not more than this
        path,
        rootState.address,
        calculateDeadline(state.deadline),
        undefined,
        extraOpts,
      ],
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
    swapExactTokensForAe: genRouterWaeMethodAction(
      'swap_exact_tokens_for_ae',
      ({ state, rootState }, { amountIn, amountOut, path }) => [
        amountIn,
        subSlippage(amountOut, state.slippage), // no less than this
        path,
        rootState.address,
        calculateDeadline(state.deadline),
        undefined,
        extraOpts,
      ],
    ),

    /**
     * @param p1 vuex context
     * @param {bigint} p2.amountOut exact amount out for the token found at path[n-1]
     * @param {bigint} p2.amountIn desired amount in for the AE found at path[0]
     * @returns {bigint[]} representing amounts in for every token from the path
     */
    swapAeForExactTokens: genRouterWaeMethodAction(
      'swap_ae_for_exact_tokens',
      ({ state, rootState }, { amountIn, amountOut, path }) => [
        amountOut,
        path,
        rootState.address,
        calculateDeadline(state.deadline),
        undefined,
        {
          ...extraOpts,
          // this is the diff between the desired+slippage and
          // the actual amount will be return into owner's wallet
          amount: addSlippage(amountIn, state.slippage).toString(),
        },
      ],
    ),
  },
};

import { shallowRef } from 'vue';
import { createStore } from 'vuex';
import {
  AeSdk,
  AeSdkAepp,
  BrowserWindowMessageConnection,
  Node,
  RpcRejectedByUserError,
  unpackTx,
  walletDetector,
} from '@aeternity/aepp-sdk';
import createPersistedState from 'vuex-persistedstate';
import {
  createDeepLinkUrl,
  findErrorExplanation,
  handleUnknownError,
  isDexBackendDisabled,
  isSafariBrowser,
  resolveWithTimeout,
} from '@/lib/utils';
import { DEFAULT_NETWORKS, IN_FRAME, IS_MOBILE } from '@/lib/constants';
import aeternityModule from './modules/aeternity';
import dexBackendModule from './modules/dexBackend';
import navigation from './modules/navigation';
import tokensModule from './modules/tokens';
import modals from './plugins/modals';
import pendingTransactionHandler from './plugins/pendingTransactionHandler';
import connectionStatusTracker from './plugins/connectionStatusTracker';

export default createStore({
  state: {
    connectingToWallet: false,
    isSdkInitializing: false,
    wallet: null,
    address: null,
    sdk: null,
    onLine: true,
    balance: 0,
    useIframeWallet: false,
    useSdkWallet: false,
    networkId: import.meta.env.VITE_DEFAULT_NETWORK,
    transactions: [],
    lang: null,
    hasSeenOnboarding: false,
  },
  getters: {
    networks() {
      return [...DEFAULT_NETWORKS].reduce((acc, n) => ({ ...acc, [n.networkId]: n }), {});
    },
    // returns the network object for the currently selected network
    // or null if no network is selected
    activeNetwork({ sdk, networkId }, { networks }) {
      return sdk && Object.values(networks).find((network) => network.networkId === networkId);
    },
    WAE({ networkId }, { activeNetwork }) {
      return networkId && activeNetwork ? activeNetwork.waeAddress : null;
    },
  },
  mutations: {
    useSdkWallet(state) {
      state.useSdkWallet = true;
    },
    setIsSdkInitializing(state, status) {
      state.isSdkInitializing = status;
    },
    setConnectingToWallet(state, payload) {
      state.connectingToWallet = payload;
    },
    enableIframeWallet(state) {
      state.useIframeWallet = true;
    },
    setAddress(state, address) {
      state.address = address;
    },
    setWallet(state, wallet) {
      state.wallet = wallet;
    },
    setSdk(state, sdk) {
      state.sdk = sdk;
    },
    setOnLine(state, onLine) {
      state.onLine = onLine;
    },
    resetState(state) {
      state.useIframeWallet = false;
      state.wallet = null;
      state.address = null;
      state.networkId = import.meta.env.VITE_DEFAULT_NETWORK;
      state.transactions = [];
    },
    setNetwork(state, networkId) {
      state.networkId = networkId;
    },
    addTransaction(state, transaction) {
      state.transactions.push(transaction);
    },
    changeTransactionById(state, { hash, index: _index, transaction }) {
      let index = _index;
      if (hash) {
        index = state.transactions.indexOf(state.transactions.find((t) => t.hash === hash));
      }
      state.transactions[index] = { ...state.transactions[index], ...transaction };
    },
    removeAllTransactions(state) {
      state.transactions = [];
    },
    setLang(state, lang) {
      state.lang = lang;
    },
    setOnboardingModalAsSeen(state) {
      state.hasSeenOnboarding = true;
    },
  },
  actions: {
    async initUniversal({ commit, dispatch, state: { networkId }, getters: { networks } }) {
      const nodes = Object.values(networks).map((network) => ({
        name: network.networkName,
        instance: new Node(network.url),
      }));

      const instance = shallowRef(new AeSdk({ nodes }));
      commit('setSdk', instance);
      await dispatch('selectNetwork', networkId);
    },
    async initSdk({ commit, dispatch, state, getters: { networks } }) {
      const nodes = Object.values(networks).map((network) => ({
        name: network.networkName,
        instance: new Node(network.url),
      }));
      const instance = shallowRef(
        new AeSdkAepp({
          nodes,
          onNetworkChange: ({ networkId }) => {
            dispatch('selectNetwork', networkId);
          },
          onAddressChange: ({ current }) => {
            const [address] = Object.keys(current);
            commit('setAddress', address);
          },
          name: 'DEX',
          onDisconnect() {
            commit('resetState');
          },
        }),
      );
      commit('setSdk', instance);
      dispatch('selectNetwork', state.networkId);
    },
    async connectWallet({ dispatch, commit, state: { sdk, address } }, walletObj = {}) {
      commit('setConnectingToWallet', true);
      commit('setWallet', walletObj.info);

      if ((IS_MOBILE || isSafariBrowser()) && !IN_FRAME) {
        if (address) {
          commit('setConnectingToWallet', false);
          return;
        }
        const addressDeepLink = createDeepLinkUrl({
          type: 'address',
          'x-success': `${window.location.href.split('?')[0]}?address={address}&networkId={networkId}`,
          'x-cancel': window.location.href.split('?')[0],
        });
        window.location = addressDeepLink;
      } else {
        try {
          await resolveWithTimeout(30000, async () => {
            const webWalletTimeout = IS_MOBILE
              ? 0
              : setTimeout(() => commit('enableIframeWallet'), 15000);
            commit('useSdkWallet');

            let resolve = null;
            let rejected = (e) => {
              throw e;
            };
            let stopScan = null;

            const connectWallet = async (wallet) => {
              try {
                const { networkId } = await sdk.connectToWallet(wallet.getConnection());
                await sdk.subscribeAddress('subscribe', 'connected');
                const currentAccountAddress = sdk.addresses()[0];
                if (!currentAccountAddress) return;
                stopScan?.();
                commit('setAddress', currentAccountAddress);
                dispatch('selectNetwork', networkId);
                resolve?.(currentAccountAddress);
              } catch (e) {
                if (!(e instanceof RpcRejectedByUserError)) {
                  dispatch('showUnknownError', e);
                  dispatch('disconnectWallet');
                }
                rejected(e);
              }
            };
            if (walletObj.getConnection) {
              await connectWallet(walletObj);
            } else {
              const handleWallet = async ({ wallets }) => {
                const detectedWalletObject = Object.values(wallets).find(
                  (wallet) => wallet.info.name === walletObj.info.name,
                );
                if (!detectedWalletObject) return;
                clearInterval(webWalletTimeout);
                await connectWallet(detectedWalletObject);
              };
              const scannerConnection = new BrowserWindowMessageConnection();
              stopScan = walletDetector(scannerConnection, handleWallet);

              await new Promise((_resolve, _rejected) => {
                resolve = _resolve;
                rejected = _rejected;
              });
            }
          });
        } catch (error) {
          if (walletObj.info.name === 'Superhero') {
            dispatch('modals/open', {
              name: 'show-error',
              message:
                'Login with your wallet has failed. Please make sure that you are logged into your wallet.',
              dismissText: 'Open My Wallet',
              resolve: () => {
                window.location = createDeepLinkUrl({
                  type: 'address',
                  'x-success': `${window.location.href.split('?')[0]}?address={address}&networkId={networkId}`,
                  'x-cancel': window.location.href.split('?')[0],
                });
              },
            });
          } else {
            dispatch('modals/open', {
              name: 'show-error',
              message: `Connection to ${walletObj.info.name} has been timeout, please try again later.`,
            });
          }
        }
      }

      commit('setConnectingToWallet', false);
    },
    async connectDefaultWallet(
      { commit, dispatch, state: { networkId } },
      { address, networkId: walletNetworkId },
    ) {
      await dispatch(
        'selectNetwork',
        !walletNetworkId || walletNetworkId.includes('networkId') ? networkId : walletNetworkId,
      );

      commit('enableIframeWallet');
      commit('setAddress', address);
      commit('setConnectingToWallet', false);
    },
    async disconnectWallet({ state: { sdk }, commit }) {
      try {
        await sdk.disconnectWallet(false);
      } catch (error) {
        // TODO
      }
      commit('resetState');
      localStorage.clear();
      window.location.search = '';
    },
    async parseAndSendTransactionFromQuery({
      commit,
      dispatch,
      state: { transactions, sdk /* address */ },
    }) {
      // const { transaction } = route.query;
      const transaction = new URLSearchParams(window.location.search).get('transaction');
      if (transactions?.length && transaction) {
        try {
          const tx = unpackTx(transaction);
          const index = transactions.indexOf(
            transactions.find((t) => JSON.stringify(t.txParams) === JSON.stringify(tx.encodedTx)),
          );

          if (index !== -1 && transactions[index].pending && transactions[index].unfinished) {
            const { txHash: hash } = await sdk.api.postTransaction({ tx: transaction });
            commit('changeTransactionById', { index, transaction: { unfinished: false, hash } });
          }
        } catch (e) {
          handleUnknownError(e);
          dispatch('modals/open', {
            name: 'show-error',
            message: 'We were unable to send the signed transaction parsed from URL.',
          });
        }
      }
    },
    async addMobileWallet({ commit, state: { address: currentAddress, route } }) {
      const { address: newAddress } = route.query;
      const address = newAddress || currentAddress;
      commit('setAddress', address);
      return address;
    },
    async selectNetwork({ commit, dispatch, state: { sdk, networkId } }, newNetworkId) {
      const nodeToSelect = (await sdk.getNodesInPool()).find(
        (node) => node.nodeNetworkId === newNetworkId,
      );

      if (!nodeToSelect) {
        commit('setNetwork', newNetworkId);
        await dispatch('modals/open', {
          name: 'show-error',
          message: `Network ${newNetworkId} is not supported, please switch to Testnet`,
          resolve: null,
        });
      } else {
        if (networkId !== newNetworkId) {
          commit('modals/closeByKey', 'show-error');
        }

        sdk.selectNode(nodeToSelect.name);
        await commit('setNetwork', newNetworkId);

        if (!isDexBackendDisabled) {
          await dispatch('backend/init');
        }
        await dispatch('aeternity/init');
      }
    },
    sendTxDeepLinkUrl({ state: { networkId } }, encodedTx) {
      const currentUrl = new URL(window.location.href);
      // reset url
      currentUrl.searchParams.delete('transaction');
      currentUrl.searchParams.delete('transaction-status');

      // append transaction parameter for success case
      const successUrl = new URL(currentUrl.href);
      successUrl.searchParams.set('transaction', '{transaction}');

      // append transaction parameter for failed case
      const cancelUrl = new URL(currentUrl.href);
      cancelUrl.searchParams.set('transaction-status', 'cancelled');

      return createDeepLinkUrl({
        type: 'sign-transaction',
        transaction: encodedTx,
        networkId,
        // decode these urls because they will be encoded again
        'x-success': decodeURI(successUrl.href),
        'x-cancel': decodeURI(cancelUrl.href),
      });
    },
    /**
     * this should be used only as a result of an error triggered
     * by user interaction and never inside a loop
     */
    showUnknownError({ dispatch, state }, error) {
      handleUnknownError(error);
      const message = error?.message ? findErrorExplanation(error.message, state) : 'Unknown error';
      dispatch('modals/open', { name: 'show-error', message });
    },

    showOnboarding({ dispatch, commit }) {
      dispatch('modals/open', { name: 'onboarding' });
      commit('setOnboardingModalAsSeen');
    },
  },

  modules: {
    aeternity: aeternityModule,
    tokens: tokensModule,
    backend: dexBackendModule,
    navigation,
  },
  plugins: [
    createPersistedState({
      reducer: ({
        address,
        transactions,
        useIframeWallet,
        networkId,
        wallet,
        lang,
        aeternity: { providedLiquidity, slippage, deadline },
        tokens: { userTokens, providers },
        hasSeenOnboarding,
      }) => ({
        address,
        transactions,
        useIframeWallet,
        networkId,
        wallet,
        lang,
        aeternity: { providedLiquidity, slippage, deadline },
        tokens: { userTokens, providers },
        hasSeenOnboarding,
      }),
    }),
    modals,
    pendingTransactionHandler,
    connectionStatusTracker,
  ],
});

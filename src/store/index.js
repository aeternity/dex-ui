import { createStore } from 'vuex';
import {
  Node, RpcAepp, WalletDetector, BrowserWindowMessageConnection, Universal, TxBuilder,
} from '@aeternity/aepp-sdk';
import createPersistedState from 'vuex-persistedstate';
import {
  handleUnknownError, findErrorExplanation, createDeepLinkUrl,
  resolveWithTimeout, isSafariBrowser,
} from '@/lib/utils';
import {
  DEFAULT_NETWORKS,
} from '@/lib/constants';
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
    networkId: process.env.VUE_APP_DEFAULT_NETWORK,
    transactions: [],
  },
  getters: {
    networks() {
      return [
        ...DEFAULT_NETWORKS,
      ].reduce((acc, n) => ({ ...acc, [n.networkId]: n }), {});
    },
    activeNetwork({ sdk }, { networks }) {
      if (!sdk || !sdk.selectedNode) {
        return null;
      }
      return networks[sdk.selectedNode.networkId];
    },
    WAE({ networkId }, { activeNetwork }) {
      return (networkId && activeNetwork) ? activeNetwork.waeAddress : null;
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
      state.networkId = process.env.VUE_APP_DEFAULT_NETWORK;
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
        index = state.transactions.indexOf(state.transactions
          .find((t) => t.hash === hash));
      }
      state.transactions[index] = { ...state.transactions[index], ...transaction };
    },
    removeAllTransactions(state) {
      state.transactions = [];
    },
  },
  actions: {
    async initUniversal({ commit, getters: { networks } }) {
      const nodes = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const network of Object.values(networks)) {
        nodes.push({
          name: network.networkName,
          // eslint-disable-next-line no-await-in-loop
          instance: await Node({ url: network.url }),
        });
      }

      const instance = await Universal({
        nodes,
        compilerUrl: process.env.VUE_APP_COMPILER_URL,
      });
      commit('setSdk', instance);
    },
    async initSdk({
      commit, dispatch, state, getters: { networks },
    }) {
      const nodes = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const network of Object.values(networks)) {
        nodes.push({
          name: network.networkName,
          // eslint-disable-next-line no-await-in-loop
          instance: await Node({ url: network.url }),
        });
      }

      const options = {
        nodes,
        compilerUrl: process.env.VUE_APP_COMPILER_URL,
      };
      const instance = await RpcAepp({
        ...options,
        onNetworkChange: ({ networkId }) => {
          dispatch('selectNetwork', networkId);
        },
        name: 'DEX',
        onDisconnect() {
          commit('resetState');
        },
      });
      commit('setSdk', instance);
      commit('setNetwork', state.networkId);
    },
    async connectWallet({ dispatch, commit, state: { sdk, address } }, wallet = {}) {
      commit('setConnectingToWallet', true);
      commit('setWallet', wallet);

      if (window.navigator.userAgent.includes('Mobi') || isSafariBrowser()) {
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
          await resolveWithTimeout(10000, async () => {
            commit('useSdkWallet');
            commit('enableIframeWallet');

            const scannerConnection = await BrowserWindowMessageConnection({
              connectionInfo: { id: 'spy' },
            });
            const detector = await WalletDetector({ connection: scannerConnection });

            await new Promise((resolve, rejected) => {
              detector.scan(async ({ wallets }) => {
                const detectedWallet = Object.values(wallets).find((w) => w.name === wallet.name);
                if (!detectedWallet) return;

                try {
                  await sdk.connectToWallet(await detectedWallet.getConnection());
                  await sdk.subscribeAddress('subscribe', 'current');
                } catch (e) {
                  if (e.message !== 'Operation rejected by user') {
                    dispatch('showUnknownError', e);
                    dispatch('disconnectWallet');
                  }
                  rejected(e);
                  return;
                }

                const currentAccountAddress = sdk.rpcClient.getCurrentAccount();
                if (!currentAccountAddress) return;
                detector.stopScan();
                const { networkId: walletNetworkId } = sdk.rpcClient.info;
                commit('setAddress', currentAccountAddress);
                dispatch('selectNetwork', walletNetworkId);
                resolve(currentAccountAddress);
              });
            });
          });
        } catch (error) {
          if (wallet.name === 'Superhero') {
            dispatch('modals/open', {
              name: 'show-error',
              message: 'Login with your wallet has failed. Please make sure that you are logged into your wallet.',
              dismissText: 'Open My Wallet',
              resolve: () => {
                const addressDeepLink = createDeepLinkUrl({
                  type: 'address',
                  'x-success': `${window.location.href.split('?')[0]}?address={address}&networkId={networkId}`,
                  'x-cancel': window.location.href.split('?')[0],
                });
                window.location = addressDeepLink;
              },
            });
          } else {
            dispatch('modals/open', {
              name: 'show-error',
              message: `Connection to ${wallet.name} has been timeout, please try again later.`,
            });
          }
        }
      }

      commit('setConnectingToWallet', false);
    },
    async connectDefaultWallet(
      { commit, dispatch },
      { address, networkId },
    ) {
      let walletNetworkId = networkId;
      if (!networkId || networkId.includes('networkId')) {
        walletNetworkId = 'ae_uat';
      }

      await dispatch('selectNetwork', walletNetworkId);

      commit('enableIframeWallet');
      commit('setAddress', address);
      commit('setConnectingToWallet', false);
    },
    async disconnectWallet({ state: { sdk } }) {
      try {
        await sdk.disconnectWallet(false);
      } catch (error) {
        // TODO
      }
      localStorage.clear();
      window.location.search = '';
    },
    async parseAndSendTransactionFromQuery(
      { commit, dispatch, state: { route, transactions, sdk } },
    ) {
      const { transaction } = route.query;
      if (transactions?.length && transaction) {
        try {
          const { tx } = TxBuilder.unpackTx(transaction);
          const index = transactions.indexOf(transactions
            .find((t) => JSON.stringify(t.txParams) === JSON.stringify(tx.encodedTx.tx)));

          if (index !== -1 && transactions[index].pending && transactions[index].unfinished) {
            const { hash } = await sdk.sendTransaction(transaction, { waitMined: false });
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
    async addMobileWallet({
      commit,
      state: { address: currentAddress, route },
    }) {
      const { address: newAddress } = route.query;
      const address = newAddress || currentAddress;
      commit('setAddress', address);
      return address;
    },
    async selectNetwork({ commit, dispatch, state: { sdk, networkId } }, newNetworkId) {
      const nodeToSelect = sdk.getNodesInPool()
        .find((node) => node.nodeNetworkId === newNetworkId);

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
        await dispatch('backend/init');
        await dispatch('aeternity/init');
      }
    },
    sendTxDeepLinkUrl({ state: { networkId } }, encodedTx) {
      return createDeepLinkUrl({
        type: 'sign-transaction',
        transaction: encodedTx,
        networkId,
        'x-success': `${window.location.href.split('?')[0]}?transaction={transaction}`,
        'x-cancel': `${window.location.href.split('?')[0]}?transaction-status=cancelled`,
      });
    },
    /**
    * this should be used only as a result of an error triggered
    * by user interaction and never inside a loop
    */
    showUnknownError({ dispatch, state }, error) {
      handleUnknownError(error);
      const message = error?.message
        ? findErrorExplanation(error.message, state)
        : 'Unknown error';
      dispatch('modals/open', { name: 'show-error', message });
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
        aeternity: { providedLiquidity, slippage, deadline },
        tokens: { userTokens, providers },
      }) => ({
        address,
        transactions,
        useIframeWallet,
        networkId,
        wallet,
        aeternity: { providedLiquidity, slippage, deadline },
        tokens: { userTokens, providers },
      }),
    }),
    modals,
    pendingTransactionHandler,
    connectionStatusTracker,
  ],
});

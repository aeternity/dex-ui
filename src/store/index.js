import { createStore } from 'vuex';
import {
  Node, RpcAepp, WalletDetector, BrowserWindowMessageConnection, Universal,
} from '@aeternity/aepp-sdk';
import createPersistedState from 'vuex-persistedstate';
import {
  handleUnknownError, findErrorExplanation, createDeepLinkUrl,
} from '@/lib/utils';
import {
  DEFAULT_NETWORKS,
} from '@/lib/constants';
import aeternityModule from './modules/aeternity';
import navigation from './modules/navigation';
import modals from './plugins/modals';

export default createStore({
  state: {
    connectingToWallet: false,
    walletName: null,
    address: null,
    sdk: null,
    balance: 0,
    useIframeWallet: false,
    useSdkWallet: false,
    networkId: null,
  },
  getters: {
    networks() {
      return [
        ...DEFAULT_NETWORKS,
      ].reduce((acc, n) => ({ ...acc, [n.networkId]: n }), {});
    },
    activeNetwork({ networkId }, { networks }) {
      return networks[networkId];
    },
  },
  mutations: {
    useSdkWallet(state) {
      state.useSdkWallet = true;
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
    setWalletName(state, walletName) {
      state.walletName = walletName;
    },
    setSdk(state, sdk) {
      state.sdk = sdk;
    },
    resetState(state) {
      state.address = null;
      state.networkId = null;
    },
    setNetwork(state, networkId) {
      state.networkId = networkId;
    },
  },
  actions: {
    async initUniversal({ commit }) {
      const instance = await Universal({
        nodes: [
          { name: 'testnet', instance: await Node({ url: process.env.VUE_APP_TESTNET_NODE_URL }) },
        ],
        compilerUrl: process.env.VUE_APP_COMPILER_URL,
      });
      commit('setSdk', instance);
    },
    async initSdk({ commit, dispatch, state }) {
      const options = {
        nodes: [
          { name: 'testnet', instance: await Node({ url: process.env.VUE_APP_TESTNET_NODE_URL }) },
        ],
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
    async connectWallet({ dispatch, commit }) {
      commit('setConnectingToWallet', true);
      if (window.navigator.userAgent.includes('Mobi')) {
        const addressDeepLink = createDeepLinkUrl({
          type: 'address',
          'x-success': `${window.location}?address={address}`,
          'x-cancel': window.location,
        });
        window.location = addressDeepLink;
      } else {
        await dispatch('scanForWallets');
      }
      commit('setConnectingToWallet', false);
    },
    async scanForWallets({ commit, dispatch, state: { sdk } }) {
      const scannerConnection = await BrowserWindowMessageConnection({
        connectionInfo: { id: 'spy' },
      });
      const detector = await WalletDetector({ connection: scannerConnection });
      // eslint-disable-next-line no-underscore-dangle
      const webWalletTimeout = window.navigator.userAgent.includes('Mobi') ? 0
        : setTimeout(() => commit('enableIframeWallet'), 10000);
      commit('useSdkWallet');
      return new Promise((resolve) => {
        detector.scan(async ({ newWallet }) => {
          if (!newWallet) return;
          clearInterval(webWalletTimeout);
          try {
            await sdk.connectToWallet(await newWallet.getConnection());
            await sdk.subscribeAddress('subscribe', 'current');
          } catch (e) {
            if (e.message !== 'Operation rejected by user') {
              dispatch('showUnknownError', e);
            }
            dispatch('disconnectWallet');
            resolve(null);
            return;
          }
          const address = sdk.rpcClient.getCurrentAccount();
          if (!address) return;
          detector.stopScan();
          const { networkId: walletNetworkId, name } = sdk.rpcClient.info;
          commit('setAddress', address);
          commit('setWalletName', name);
          dispatch('selectNetwork', walletNetworkId);
          resolve(address);
        });
      });
    },
    async disconnectWallet({ commit, state: { sdk } }) {
      await sdk.disconnectWallet(false);
      commit('resetState');
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

      if (nodeToSelect && networkId === newNetworkId) return;

      if (!nodeToSelect) {
        commit('setNetwork', newNetworkId);
        await dispatch('modals/open', {
          name: 'show-error',
          message: `Network ${newNetworkId} is not supported, please switch to Testnet`,
          resolve: null,
        });
      } else {
        commit('modals/closeByKey', 'show-error');
        sdk.selectNode(nodeToSelect.name);
        commit('setNetwork', newNetworkId);
      }
    },
    sendTxDeepLinkUrl({ state: { networkId } }, encodedTx) {
      return createDeepLinkUrl({
        type: 'sign-transaction',
        transaction: encodedTx,
        networkId,
        broadcast: true,
        'x-success': window.location.href.split('?')[0],
        'x-cancel': window.location.href.split('?')[0],
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
    navigation,
  },
  plugins: [
    createPersistedState({
      reducer: ({
        address, networkId, aeternity: { providedLiquidity, slippage, deadline },
      }) => ({
        address,
        networkId,
        aeternity: { providedLiquidity, slippage, deadline },
      }),
    }),
    modals,
  ],
});

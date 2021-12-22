import { createStore } from 'vuex';
import {
  Node, RpcAepp, WalletDetector, BrowserWindowMessageConnection,
} from '@aeternity/aepp-sdk';
import createPersistedState from 'vuex-persistedstate';
import aeternityModule from './modules/aeternity';
import modals from './plugins/modals';

export default createStore({
  state: {
    address: null,
    sdk: null,
    balance: 0,
    useIframeWallet: false,
    networkId: 'ae_mainnet',
  },
  mutations: {
    enableIframeWallet(state) {
      state.useIframeWallet = true;
    },
    setAddress(state, address) {
      state.address = address;
    },
    setSdk(state, sdk) {
      state.sdk = sdk;
    },
    resetState(state) {
      state.address = null;
    },
    setNetwork(state, networkId) {
      const [{ name }] = state.sdk.getNodesInPool()
        .filter((node) => node.nodeNetworkId === networkId);
      state.sdk.selectNode(name);
      state.networkId = networkId;
    },
  },
  actions: {
    async initSdk({ commit, state }) {
      const options = {
        nodes: [
          { name: 'testnet', instance: await Node({ url: process.env.VUE_APP_TESTNET_NODE_URL }) },
          { name: 'mainnet', instance: await Node({ url: process.env.VUE_APP_MAINNET_NODE_URL }) },
        ],
        compilerUrl: process.env.VUE_APP_COMPILER_URL,
      };
      const instance = await RpcAepp({
        ...options,
        onNetworkChange: ({ networkId }) => {
          commit('setNetwork', networkId);
        },
        name: 'DEX',
        onDisconnect() {
          commit('resetState');
        },
      });
      commit('setSdk', instance);
      commit('setNetwork', state.networkId);
    },
    async scanForWallets({ commit, dispatch, state: { sdk, networkId } }) {
      const scannerConnection = await BrowserWindowMessageConnection({
        connectionInfo: { id: 'spy' },
      });
      const detector = await WalletDetector({ connection: scannerConnection });
      // eslint-disable-next-line no-underscore-dangle
      const webWalletTimeout = window.navigator.userAgent.includes('Mobi') ? 0
        : setTimeout(() => commit('enableIframeWallet'), 10000);

      return new Promise((resolve) => {
        detector.scan(async ({ newWallet }) => {
          if (!newWallet) return;
          clearInterval(webWalletTimeout);
          await sdk.connectToWallet(await newWallet.getConnection());
          await sdk.subscribeAddress('subscribe', 'current');
          const address = sdk.rpcClient.getCurrentAccount();
          if (!address) return;
          detector.stopScan();
          const { networkId: walletNetworkId } = sdk.rpcClient.info;
          commit('setAddress', address);
          if (walletNetworkId !== networkId) {
            commit('setNetwork', walletNetworkId);
          }
          await dispatch('aeternity/initRouter', sdk);
          await dispatch('aeternity/initFactory', sdk);
          await dispatch('aeternity/initWae', sdk);
          resolve(address);
        });
      });
    },
  },
  modules: {
    aeternity: aeternityModule,
  },
  plugins: [
    createPersistedState({
      paths: ['address', 'network'],
    }),
    modals,
  ],
});

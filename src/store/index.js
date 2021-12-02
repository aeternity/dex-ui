import { createStore } from 'vuex';
import {
  Node, RpcAepp, WalletDetector, BrowserWindowMessageConnection,
} from '@aeternity/aepp-sdk';
import aeternityModule from './modules/aeternity';
import modals from './plugins/modals';

export default createStore({
  state: {
    address: null,
    sdk: null,
    balance: 0,
    useIframeWallet: false,
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
  },
  actions: {
    async initSdk({ commit }) {
      const options = {
        nodes: [{ name: 'node', instance: await Node({ url: process.env.VUE_APP_NODE_URL }) }],
        compilerUrl: process.env.VUE_APP_COMPILER_URL,
      };
      const instance = await RpcAepp({
        ...options,
        name: 'Superhero',
        onDisconnect() {
          commit('resetState');
        },
      });
      commit('setSdk', instance);
    },
    async scanForWallets({ commit, dispatch, state: { sdk } }) {
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
          commit('setAddress', address);
          await dispatch('aeternity/initRouter', sdk);
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
    modals,
  ],
});

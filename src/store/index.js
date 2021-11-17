import { createStore } from 'vuex';
import {
  Node, RpcAepp, WalletDetector, BrowserWindowMessageConnection,
} from '@aeternity/aepp-sdk';

export default createStore({
  state: {
    address: null,
    sdk: null,
    balance: 0,
  },
  mutations: {
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
    async scanForWallets({ commit, state: { sdk } }) {
      const scannerConnection = await BrowserWindowMessageConnection({
        connectionInfo: { id: 'spy' },
      });
      const detector = await WalletDetector({ connection: scannerConnection });
      return new Promise((resolve) => {
        detector.scan(async ({ newWallet }) => {
          if (!newWallet) return;
          await sdk.connectToWallet(await newWallet.getConnection());
          await sdk.subscribeAddress('subscribe', 'current');
          const address = sdk.rpcClient.getCurrentAccount();
          if (!address) return;
          detector.stopScan();
          commit('setAddress', address);
          resolve(address);
        });
      });
    },
  },
  modules: {
  },
});

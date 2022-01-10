import { createStore } from 'vuex';
import {
  Node, RpcAepp, WalletDetector, BrowserWindowMessageConnection,
} from '@aeternity/aepp-sdk';
import createPersistedState from 'vuex-persistedstate';
import { createDeepLinkUrl } from '@/lib/utils';
import aeternityModule from './modules/aeternity';
import modals from './plugins/modals';

export const dataStore = {
  state: {
    data: [],
  },
};
export default createStore({
  state: {
    address: null,
    sdk: null,
    balance: 0,
    useIframeWallet: false,
    networkId: 'ae_uat',
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
      state.networkId = networkId;
    },
  },
  actions: {
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
            dispatch('selectNetwork', networkId);
          }
          await dispatch('aeternity/initRouter', sdk);
          await dispatch('aeternity/initFactory', sdk);
          await dispatch('aeternity/initWae', sdk);
          resolve(address);
        });
      });
    },
    async selectNetwork({ commit, dispatch, state: { sdk, networkId } }, newNetworkId) {
      if (networkId === newNetworkId) return;
      const nodeToSelect = sdk.getNodesInPool()
        .find((node) => node.nodeNetworkId === newNetworkId);
      if (!nodeToSelect) {
        await dispatch('modals/open', {
          name: 'show-error',
          message: `Network ${newNetworkId} is not supported in the DEX.
            Please select another network in your wallet.`,
          resolve: async () => {
            dispatch('modals/close');
          },
        });
      } else {
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
  },
  modules: {
    aeternity: aeternityModule,
    dataStore,
  },
  plugins: [
    createPersistedState({
      paths: ['address', 'network', 'slippage', 'aeternity.providedLiquidity'],
    }),
    modals,
  ],
});

import { Node } from '@aeternity/aepp-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import store from '@/store';
import { registerModal } from '@/store/plugins/modals';
import { createDeepLinkUrl } from '@/lib/utils';

vi.hoisted(() => {
  // The in-app browser exposes its native bridge before any script runs
  window.cordova_iab = { postMessage: () => {} };
  Object.defineProperty(window.navigator, 'userAgent', {
    value:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36',
    configurable: true,
  });
});

vi.mock('@/lib/utils', async (importOriginal) => ({
  ...(await importOriginal()),
  createDeepLinkUrl: vi.fn(),
}));

vi.spyOn(Node.prototype, 'getNodeInfo').mockReturnValue(new Promise(() => {}));
registerModal({ name: 'show-error', component: {} });

const ACCOUNT = 'ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E';
const WALLET_INFO = {
  id: 'superhero-wallet',
  name: 'Superhero',
  networkId: 'ae_uat',
  origin: window.origin,
  type: 'extension',
};

// The wallet posts its messages from inside the page
const postToAepp = (data) =>
  window.dispatchEvent(
    new MessageEvent('message', {
      data: { type: 'to_aepp', data: { jsonrpc: '2.0', ...data } },
      origin: window.origin,
      source: window,
    }),
  );

let announceTimeout;
let rejectsSubscription;

// Until an aepp connects, starting only after the page has loaded
const announce = (delay) => {
  announceTimeout = setTimeout(function next() {
    postToAepp({ method: 'connection.announcePresence', params: WALLET_INFO });
    announceTimeout = setTimeout(next, 3000);
  }, delay);
};

const handleAeppMessage = ({ data }) => {
  if (data?.type !== 'to_waellet') return;
  const { id, method, params } = data.data;
  if (method === 'connection.open') {
    clearTimeout(announceTimeout);
    postToAepp({ id, method, result: WALLET_INFO });
  }
  if (method === 'address.subscribe') {
    postToAepp(
      rejectsSubscription
        ? { id, method, error: { code: 4, message: 'Operation rejected by user' } }
        : {
            id,
            method,
            result: {
              subscription: [params.value],
              address: { current: { [ACCOUNT]: {} }, connected: {} },
            },
          },
    );
  }
  if (method === 'connection.close') announce(0);
};

describe('in the Superhero Wallet in-app browser', () => {
  beforeEach(async () => {
    rejectsSubscription = false;
    window.addEventListener('message', handleAeppMessage);
    announce(1000);
    await store.dispatch('initSdk');
  });

  afterEach(() => {
    window.removeEventListener('message', handleAeppMessage);
    clearTimeout(announceTimeout);
    try {
      store.state.sdk.disconnectWallet();
    } catch (e) {
      // not connected
    }
    vi.clearAllMocks();
  });

  it('connects to the wallet announcing itself late, without a deep link', async () => {
    await store.dispatch('connectWallet', { info: WALLET_INFO });

    expect(store.state.address).toBe(ACCOUNT);
    expect(store.state.useSdkWallet).toBe(true);
    expect(createDeepLinkUrl).not.toHaveBeenCalled();
  });

  it('drops a restored session the wallet does not take back', async () => {
    store.commit('setAddress', ACCOUNT);
    store.commit('setWallet', WALLET_INFO);
    rejectsSubscription = true;

    await store.dispatch('connectWallet', { info: WALLET_INFO });

    expect(store.state.address).toBe(null);
    expect(store.state.wallet).toBe(null);
    store.state.modals.opened.find(({ name }) => name === 'show-error').props.resolve();
    expect(createDeepLinkUrl).not.toHaveBeenCalled();

    rejectsSubscription = false;
    await store.dispatch('connectWallet', { info: WALLET_INFO });
    expect(store.state.address).toBe(ACCOUNT);
  }, 10000);
});

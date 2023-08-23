import { IS_MOBILE } from '@/lib/constants';

export default (store) => {
  const connectionStatusHandler = () => {
    if (store.state.onLine !== navigator.onLine) store.commit('setOnLine', navigator.onLine);
    if (!navigator.onLine && !IS_MOBILE) {
      store.dispatch('modals/open', {
        name: 'connection-status',
        text: 'You are offline... Please check your connection.',
      });
    }
  };

  window.addEventListener('online', connectionStatusHandler);
  window.addEventListener('offline', connectionStatusHandler);
};

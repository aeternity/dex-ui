export default (store) => {
  const connectionStatusHandler = () => {
    if (store.state.onLine !== navigator.onLine) store.commit('setOnLine', navigator.onLine);
    if (!navigator.onLine && !window.navigator.userAgent.includes('Mobi')) {
      store.dispatch('modals/open', {
        name: 'connection-status',
        text: 'You are offline... Please check your connection.',
      });
    }
  };

  window.addEventListener('online', connectionStatusHandler);
  window.addEventListener('offline', connectionStatusHandler);
};

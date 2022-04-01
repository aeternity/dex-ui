export default async (store) => {
  const waitTransactionMined = async ({
    hash, info,
  }) => {
    let error = false;
    try {
      await store.state.sdk.poll(hash);
      store.dispatch('modals/open', { name: 'transaction-status', hash, info });
    } catch (e) {
      error = true;
      store.dispatch('modals/open', {
        name: 'transaction-status', hash, info, error,
      });
    } finally {
      store.commit('removePendingTransactionByHash', { hash, error });
    }
  };

  store.watch(
    ({ sdk }) => sdk,
    () => store.state.transactions.filter((t) => t.pending).forEach(waitTransactionMined),
  );

  store.subscribe(async (mutation) => {
    if (mutation.type !== 'addTransaction') return;
    await waitTransactionMined(mutation.payload);
  });
};

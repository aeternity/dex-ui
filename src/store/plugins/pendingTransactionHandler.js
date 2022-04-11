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
      store.commit('changeTransactionById', { hash, transaction: { error, pending: false } });
    }
  };

  store.watch(
    ({ sdk }) => sdk,
    () => store.state.transactions
      .filter((t) => t.pending && !t.unfinished).forEach(waitTransactionMined),
  );

  store.subscribe(async (mutation) => {
    if (mutation.type === 'changeTransactionById' && mutation.payload.transaction?.pending !== false) {
      const { hash, index: _index } = mutation.payload;
      let index = _index;
      if (hash) {
        index = store.state.transactions.indexOf(store.state.transactions
          .find((t) => t.hash === hash));
      }
      await waitTransactionMined(store.state.transactions[index]);
    }
    if (mutation.type !== 'addTransaction') return;
    await waitTransactionMined(mutation.payload);
  });
};

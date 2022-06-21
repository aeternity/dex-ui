export default async (store) => {
  const waitTransactionMined = async ({
    hash, info,
  }) => {
    let error = false;
    try {
      const returnedTransaction = await store.state.sdk.poll(hash);
      if (returnedTransaction.returnType !== 'ok') error = true;
    } catch (e) {
      error = true;
    } finally {
      store.dispatch('modals/open', {
        name: 'transaction-status', hash, info, error,
      });
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

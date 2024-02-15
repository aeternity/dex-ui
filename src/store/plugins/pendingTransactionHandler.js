import { handleCallError, findErrorExplanation } from '@/lib/utils';

export default async (store) => {
  const waitTransactionMined = async ({
    hash, info,
  }) => {
    let error = false;
    let errorMessage = '';
    try {
      const returnedTransaction = await store.state.sdk.poll(hash);
      const { callInfo } = await store.state.sdk.api.getTransactionInfoByHash(hash);
      handleCallError(
        callInfo,
        store.state.aeternity?.wae?.$options.address === returnedTransaction.contractId
          ? store.state.aeternity.wae
          : store.state.aeternity.router,
      );
    } catch (e) {
      error = true;
      errorMessage = findErrorExplanation(e.message, store.state);
    } finally {
      if (errorMessage) console.error(errorMessage);
      store.dispatch('modals/open', {
        name: 'transaction-status', hash, info, error, errorMessage,
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
    if (mutation.type !== 'addTransaction'
    || (mutation.type === 'addTransaction' && mutation.payload?.unfinished)) return;
    await waitTransactionMined(mutation.payload);
  });
};

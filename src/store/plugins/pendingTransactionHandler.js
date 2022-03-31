export default async (store) => {
  const waitTransactionMined = async ({
    hash,
  }) => {
    try {
      await store.state.sdk.poll(hash);
    } finally {
      store.commit('removePendingTransactionByHash', hash);
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

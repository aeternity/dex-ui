<template>
  <span>
    {{ balance.toFixed(fixed) }}
  </span>
</template>

<script>
import {
  onBeforeUnmount, ref, watch, toRef,
} from 'vue';
import { useStore } from 'vuex';
import BigNumber from 'bignumber.js';
import FUNGIBLE_TOKEN_CONTRACT from 'aeternity-fungible-token/FungibleTokenFullInterface.aes';
import {
  fetchJson, aettosToAe, handleUnknownError, isNotFoundError,
} from '../lib/utils';

const pollState = {};
let storeState;
async function poll() {
  await Promise.allSettled(
    Object.entries(pollState)
      .filter(([, state]) => state.refs.length)
      .map(async ([address, state]) => {
        if (address.startsWith('ct_') && storeState.value.address) {
          const tokenContract = await storeState.value.sdk.getContractInstance(
            FUNGIBLE_TOKEN_CONTRACT, {
              contractAddress: address,
            },
          );
          if (!state.decimals) {
            state.decimals = (await tokenContract.methods.meta_info()).decodedResult.decimals;
          }
          state.lastValue = new BigNumber(
            (await tokenContract.methods.balance(storeState.value.address)).decodedResult || 0,
          ).shiftedBy(-state.decimals);
        } else if (address.startsWith('ak_')) {
          try {
            state.lastValue = new BigNumber(aettosToAe(
              (await fetchJson(`https://mainnet.aeternity.io/v3/accounts/${address}`)).balance,
            ));
          } catch (e) {
            if (isNotFoundError(e)) return;
            handleUnknownError(e);
          }
        }
        // eslint-disable-next-line no-return-assign, no-param-reassign
        state.refs.forEach((r) => r.value = state.lastValue);
      }),
  );
  setTimeout(poll, 1000);
}
poll();
function getBalanceRef(addressRef) {
  const r = ref(0);
  watch(
    () => addressRef.value,
    (address, prevAddress) => {
      if (prevAddress) {
        // eslint-disable-next-line vue/no-ref-as-operand
        pollState[prevAddress].refs = pollState[prevAddress].refs.filter((i) => i !== r);
      }
      pollState[address] ||= { refs: [], lastValue: 0 };
      pollState[address].refs.push(r);
      r.value = pollState[address].lastValue;
    },
    { immediate: true },
  );
  onBeforeUnmount(() => {
    // eslint-disable-next-line vue/no-ref-as-operand
    pollState[addressRef.value].refs = pollState[addressRef.value].refs.filter((i) => i !== r);
  });
  return r;
}
export default {
  props: {
    address: { type: String, required: true },
    fixed: { type: Number, default: 2 },
  },
  emits: ['update:balance'],
  setup(props, { emit }) {
    storeState = toRef(useStore(), 'state');
    const balance = getBalanceRef(toRef(props, 'address'));
    watch(() => balance.value, (newVal) => {
      emit('update:balance', newVal);
    });
    return {
      balance,
    };
  },
};
</script>

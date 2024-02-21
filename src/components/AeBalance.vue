<template>
  <span v-if="balance">
    {{ balance.toFixed(fixed) }}
  </span>
  <AnimatedSpinner v-else class="spinner" />
</template>

<script>
import { onBeforeUnmount, ref, watch, toRef } from 'vue';
import { useStore } from 'vuex';
import BigNumber from 'bignumber.js';
import FUNGIBLE_TOKEN_CONTRACT from 'dex-contracts-v2/build/FungibleTokenFull.aci.json';
import { aettosToAe, handleUnknownError, isNotFoundError } from '@/lib/utils';
import AnimatedSpinner from '@/assets/animated-spinner.svg';

const pollState = {};
let storeState;

async function poll() {
  await Promise.allSettled(
    Object.entries(pollState)
      .filter(([, state]) => state.refs.length)
      .map(async ([address, state]) => {
        try {
          if (address.startsWith('ct_') && storeState.value.address) {
            if (!state.instance) {
              state.instance = await storeState.value.sdk.initializeContract({
                aci: FUNGIBLE_TOKEN_CONTRACT,
                address,
              });
            }

            if (!state.decimals) {
              state.decimals = new BigNumber(
                (await state.instance.meta_info()).decodedResult.decimals,
              );
            }
            state.lastValue = new BigNumber(
              (await state.instance.balance(storeState.value.address)).decodedResult || 0,
            ).shiftedBy(state.decimals.times(-1).toNumber());
          } else if (address.startsWith('ak_') && storeState.value.sdk) {
            state.lastValue = new BigNumber(
              aettosToAe(
                await storeState.value.sdk
                  .getBalance(address)
                  .catch((e) => (isNotFoundError(e) ? 0 : handleUnknownError(e))),
              ),
            );
          }
        } catch (e) {
          if (e?.message.indexOf('tx_nonce_too_high_for_account') === -1) {
            state.lastValue = BigNumber(0);
          }
          handleUnknownError(e);
        }
        // eslint-disable-next-line no-return-assign, no-param-reassign
        state.refs.forEach((r) => (r.value = state.lastValue));
      }),
  );
  setTimeout(poll, 2000);
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
      pollState[address] ||= { refs: [], lastValue: BigNumber(0) };
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
  components: { AnimatedSpinner },
  props: {
    address: { type: String, required: true },
    fixed: { type: Number, default: 2 },
  },
  emits: ['update:balance'],
  setup(props, { emit }) {
    storeState = toRef(useStore(), 'state');
    const balanceRef = getBalanceRef(toRef(props, 'address'));
    const balance = ref(0);

    watch(
      () => balanceRef.value,
      async (newVal) => {
        const networkId = await storeState.value.sdk.api.getNetworkId().catch(() => null);
        if (storeState.value.sdk && storeState.value.networkId === networkId) {
          balance.value = newVal;
          emit('update:balance', newVal);
        } else {
          balance.value = new BigNumber(0);
          emit('update:balance', new BigNumber(0));
        }
      },
    );

    return {
      balance,
    };
  },
};
</script>

<style lang="scss">
.spinner {
  height: 15px;
  width: 20px;
}
</style>

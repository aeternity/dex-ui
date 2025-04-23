<template>
  <div class="token-icon">
    <component
      :is="selectedIcon(tokenA)"
      v-if="selectedIcon(tokenA)"
      :class="{ rotating, 'not-pool-token': !tokenB }"
    />
    <img
      v-else-if="tokenA"
      :class="{ rotating, 'not-pool-token': !tokenB }"
      :src="mapToken(tokenA)"
      alt=""
    />
    <component :is="selectedIcon(tokenB)" v-if="selectedIcon(tokenB)" />
    <img v-else-if="tokenB" :class="{ rotating }" :src="mapToken(tokenB)" alt="" />
  </div>
</template>

<script>
import AeIcon from '@/assets/ae.svg';
import EthIcon from '@/assets/ethereum.svg';

import { WRAPPED_ETHEREUM_MAINNET_CONTRACT_ADDRESS } from '@/lib/constants';

export default {
  components: {
    AeIcon,
  },
  props: {
    tokenA: { type: Object, default: null },
    tokenB: { type: Object, default: null },
    rotating: { type: Boolean },
  },
  methods: {
    mapToken(token) {
      return `https://avatars.z52da5wt.xyz/${token.contract_id}`;
    },
    selectedIcon(token) {
      if (token && token.is_ae) return AeIcon;
      return token?.contract_id === WRAPPED_ETHEREUM_MAINNET_CONTRACT_ADDRESS ? EthIcon : undefined;
    },
  },
};
</script>

<style lang="scss" scoped>
.token-icon {
  display: flex;

  img,
  svg {
    height: 24px;
    width: 24px;
    border-radius: 24px;
  }

  img:not(.not-pool-token):nth-of-type(2),
  svg:not(.not-pool-token):nth-of-type(2) {
    margin-left: -10px;
  }
}
</style>

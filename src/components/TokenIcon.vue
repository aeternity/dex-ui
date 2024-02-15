<template>
  <div class="token-icon">
    <img
      v-if="tokenA"
      :class="{ rotating, 'not-pool-token': !tokenB }"
      :src="mapToken(tokenA)"
      alt=""
    >
    <img
      v-if="tokenB"
      :class="{ rotating }"
      :src="mapToken(tokenB)"
      alt=""
    >
  </div>
</template>

<script>
import AeIcon from '@/assets/ae.svg';

export default {
  props: {
    tokenA: { type: Object, required: true },
    tokenB: { type: Object, default: null },
    rotating: { type: Boolean },
  },
  methods: {
    mapToken(token) {
      return token.is_ae !== undefined ? AeIcon : `https://avatars.z52da5wt.xyz/${token.contract_id}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.token-icon {
  display: flex;

  img {
    height: 24px;
    width: 24px;
    border-radius: 24px;
  }

  img:not(.not-pool-token):nth-of-type(2) {
    margin-left: -10px;
  }
}
</style>

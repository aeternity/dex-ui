<template>
  <div class="token-icon">
    <img
      v-if="tokenA && !tokenA.is_ae"
      :class="{ rotating, 'not-pool-token': !tokenB }"
      :src="mapToken(tokenA)"
      alt=""
    />
    <AeIcon v-else-if="tokenA && tokenA.is_ae" :class="{ rotating, 'not-pool-token': !tokenB }" />
    <img v-if="tokenB && !tokenB.is_ae" :class="{ rotating }" :src="mapToken(tokenB)" alt="" />
    <AeIcon v-else-if="tokenB && tokenB.is_ae" />
  </div>
</template>

<script>
import AeIcon from '@/assets/ae.svg';

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

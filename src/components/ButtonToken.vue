<template>
  <ButtonDefault
    v-bind="$attrs"
    :fill="token ? 'dark' : 'blue'"
    class="button-token"
    @click="selectToken"
  >
    <div class="token">
      <img
        v-if="token"
        :src="`https://avatars.z52da5wt.xyz/${token.contract_id}`"
      >
      <span>{{ token && token.symbol || 'Select token' }}</span>
    </div>
    <img
      v-if="arrow"
      src="../assets/arrow.svg"
    >
  </ButtonDefault>
</template>

<script>
import ButtonDefault from './ButtonDefault.vue';

export default {
  components: {
    ButtonDefault,
  },
  props: {
    token: { type: Object, default: null },
    arrow: { type: Boolean },
  },
  emits: ['update:token'],
  methods: {
    async selectToken() {
      const token = await this.$store.dispatch('modals/open', { name: 'select-token' });
      if (token) this.$emit('update:token', token);
    },
  },
};
</script>

<style lang="scss" scoped>
.button-token {
  padding: 16px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px;

  .token {
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    max-width: 200px;

    img {
      width: 24px;
      height: 24px;
      border-radius: 24px;
    }

    > span {
      font-weight: 500;
      font-size: 18px;
      margin-left: 12px;
    }
  }

  img {
    width: 24px;
    height: 24px;
  }
}
</style>

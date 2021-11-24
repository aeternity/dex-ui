<template>
  <ButtonDefault
    v-bind="$attrs"
    class="button-token"
    @click="showTokenModal"
  >
    <div class="token">
      <div
        v-if="$slots.icon"
        class="icon"
      >
        <slot name="icon" />
      </div>
      <span>{{ title }}</span>
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
    title: { type: String, required: true },
    arrow: { type: Boolean },
  },
  methods: {
    async showTokenModal() {
      this.$store.dispatch('modals/open', { name: 'select-token' });
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

    .icon :deep(img) {
      width: 24px;
      height: 24px;
      border-radius: 24px;
    }

    > span {
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

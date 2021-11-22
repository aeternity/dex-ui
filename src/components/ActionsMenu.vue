<template>
  <div
    class="actions-menu"
    :class="{ active: showMenu }"
    @click="showMenu = true"
  >
    <slot name="display" />
    <SmallModal
      v-if="showMenu"
      @close="showMenu = false"
    >
      <slot />
    </SmallModal>
  </div>
</template>

<script>
import SmallModal from './SmallModal.vue';

export default {
  components: {
    SmallModal,
  },
  data() {
    return {
      showMenu: false,
    };
  },
};
</script>

<style lang="scss" scoped>
.actions-menu {
  position: relative;

  &:hover {
    cursor: pointer;
  }

  :deep(.small-modal > .content) {
    padding: 8px;
    border-radius: 12px;
    background-color: rgb(44, 47, 54);
    top: 50px;
    right: 0;
    white-space: nowrap;
  }
}
</style>

<template>
  <div
    class="actions-menu"
    :class="{ active: showMenu }"
    @click="showMenu = true"
    @keydown="showMenu = true"
  >
    <slot name="display" />
    <SmallModal v-if="showMenu" @close="showMenu = false">
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
@use '../styles/variables.scss';

.actions-menu {
  position: relative;

  &:hover {
    cursor: pointer;
  }

  :deep(.small-modal > .content) {
    padding: 8px;
    border-radius: 12px;
    background-color: variables.$color-black3;
    top: 50px;
    right: 0;
    white-space: nowrap;
    z-index: 1;
  }
}
</style>

<template>
  <button
    :disabled="disabled"
    class="button-plain"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    disabled: Boolean,
  },
};
</script>

<style lang="scss" scoped>
.button-plain {
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
}
</style>

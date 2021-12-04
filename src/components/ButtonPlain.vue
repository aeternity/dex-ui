<template>
  <Component
    :is="!disabled && to ? 'RouterLink' : 'button'"
    :to="to"
    :disabled="disabled"
    class="button-plain"
  >
    <slot />
  </Component>
</template>

<script>
export default {
  props: {
    to: { type: [String, Object], default: null },
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
  text-decoration: none;
  cursor: pointer;
}
</style>

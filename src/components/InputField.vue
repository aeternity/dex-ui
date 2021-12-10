<template>
  <input
    class="input-field"
    v-bind="$attrs"
    autocomplete="off"
    :value="value"
    step="any"
    @input="$emit('update:value', $event.target.value)"
  >
</template>

<script>
export default {
  props: {
    value: { type: [String, Number], default: null },
  },
  emits: ['update:value'],
};
</script>

<style lang="scss" scoped>
.input-field {
  text-align: right;
  display: block;
  width: 100%;
  padding: 0;
  outline: none;
  border: none;
  background: transparent;
  box-shadow: none;
  color: white;

  &[type='number'] {
    -moz-appearance: textfield;
  }

  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
}
</style>

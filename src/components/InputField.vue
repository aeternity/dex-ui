<template>
  <input
    class="input-field"
    v-bind="$attrs"
    autocomplete="off"
    :value="modelValue"
    step="any"
    @input="$emit('update:modelValue', $event.target.value)"
  >
</template>

<script>
export default {
  props: {
    modelValue: { type: [String, Number], default: null },
  },
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
}
</style>

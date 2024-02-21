<template>
  <input
    class="input-field"
    v-bind="$attrs"
    autocomplete="off"
    :value="value"
    step="any"
    @keypress="isNumber($event)"
    @input="$emit('update:value', $event.target.value)"
  />
</template>

<script>
export default {
  props: {
    value: { type: [String, Number], default: null },
  },
  emits: ['update:value'],
  methods: {
    isNumber(evt) {
      if (!this.$attrs || !this.$attrs.type || this.$attrs.type !== 'number') return true;

      const charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
        evt.preventDefault();
        return false;
      }
      return true;
    },
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

  &[type='number'] {
    -moz-appearance: textfield;
  }

  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
}
</style>

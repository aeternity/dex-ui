<template>
  <div class="input-amount">
    <slot name="left" />
    <InputField type="number" v-bind="$attrs" @input="$emit('input', $event)" />
    <slot name="right" />
  </div>
</template>

<script>
import InputField from './InputField.vue';

export default {
  components: {
    InputField,
  },
  emits: ['input'],
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.input-amount {
  display: flex;
  align-items: center;
  background: variables.$color-black2;
  border: 1px solid variables.$color-black2;
  min-width: 56px;

  &:focus-within {
    border: 1px solid variables.$color-primary;
  }
}
</style>

<template>
  <div class="input-amount">
    <slot name="left" />
    <InputField
      type="number"
      :value="value"
      v-bind="$attrs"
      @update:value="$emit('update:value', $event)"
    />
    <slot name="right" />
  </div>
</template>

<script>
import InputField from './InputField.vue';

export default {
  components: {
    InputField,
  },
  props: {
    value: { type: [String, Number], default: '' },
  },
  emits: ['update:value'],
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

<template>
  <div class="input-amount">
    <slot name="left" />
    <InputField
      type="number"
      v-bind="$attrs"
      @input="$emit('input', $event)"
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
  emits: ['input'],
};
</script>

<style lang="scss" scoped>
.input-amount {
  display: flex;
  align-items: center;
  background: rgb(33, 36, 41);
  border: 1px solid rgb(64, 68, 79);
  min-width: 56px;

  &:hover {
    border: 1px solid rgb(86, 90, 105)
  }
}
</style>

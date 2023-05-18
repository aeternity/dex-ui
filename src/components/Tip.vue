<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="tip">
    {{ `${tip}` }}
  </div>
</template>

<script>
export default {
  props: {
    tip: { type: String, required: true },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.tip {
  color: variables.$color-gray2;
  padding: 16px;
  text-align: left;
}
</style>

<template>
  <div class="flex flex-col text-left">
    <div class="text-xs">{{ title }}</div>
    <div class="flex flex-row">
      <div class="text-xl">{{ value }}</div>
      <div v-if="change" class="text-xs">{{ change }}</div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'StatElement',
  props: {
    title: { type: String, required: true },
    value: { type: String, required: true },
    change: { type: String, required: false, default: null },
  },
};
</script>
<style lang="scss" scoped></style>

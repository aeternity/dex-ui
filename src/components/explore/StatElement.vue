<template>
  <div class="flex flex-col text-left pb-2">
    <div class="text-xs">{{ title }}</div>
    <div class="flex flex-row">
      <div class="text-2xl font-bold">{{ value }}</div>
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

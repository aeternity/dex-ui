<template>
  <div>
    <div class="mb-1 text-gray-400">{{ title }}</div>
    <div v-if="link">
      <a class="flex gap-2" :href="link" target="_blank" rel="noopener noreferrer">
        {{ value }}
        <ExternalLinkIcon aria-hidden="true" />
        <span class="sr-only">External link</span>
      </a>
    </div>
    <div v-else>
      {{ value }}
    </div>
  </div>
</template>
<script>
import ExternalLinkIcon from '@/assets/external-link.svg';

export default {
  name: 'InfoElement',
  components: { ExternalLinkIcon },
  props: {
    value: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: false,
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
  },
};
</script>
<style scoped lang="scss">
svg {
  width: 18px;
  height: 18px;
  margin-top: 3px;
}
</style>

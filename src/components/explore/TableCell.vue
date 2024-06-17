<template>
  <a v-if="link" :href="link" target="_blank" class="flex gap-2" rel="noopener noreferrer">
    {{ text }}
    <template v-if="link.includes('https')">
      <ExternalLinkIcon aria-hidden="true" />
      <span class="sr-only">External link</span>
    </template>
  </a>
  <span v-else>{{ text }}</span>
</template>

<script>
import ExternalLinkIcon from '@/assets/external-link.svg';

export default {
  name: 'TableCell',
  components: { ExternalLinkIcon },
  props: {
    link: {
      type: String,
      required: false,
      default: null,
    },
    text: {
      type: String,
      required: true,
    },
  },
};
</script>
<style scoped lang="scss">
svg {
  width: 16px;
  height: 16px;
}
</style>

<template>
  <!-- external link -->
  <template v-if="link && link.includes('https')">
    <a :href="link" target="_blank" class="flex gap-2" rel="noopener noreferrer">
      {{ text }}
      <ExternalLinkIcon aria-hidden="true" />
      <span class="sr-only">External link</span>
    </a>
  </template>
  <!-- internal link -->
  <template v-else-if="link">
    <router-link :to="link" class="flex gap-2">
      {{ text }}
    </router-link>
  </template>
  <!-- no link -->
  <template v-else>
    <span>{{ text }}</span>
  </template>
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

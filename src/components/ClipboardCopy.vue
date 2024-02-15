<template>
  <span
    class="clipboard"
    @click.prevent="copy()"
    @keydown.prevent="copy()"
  >
    <CopyIcon />
    <span>{{ copied ? $t('copied') : title }}</span>
  </span>
</template>

<script>
import CopyIcon from '@/assets/copy.svg';

export default {
  components: {
    CopyIcon,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      copied: false,
    };
  },
  methods: {
    copy() {
      this.copied = true;
      navigator.clipboard.writeText(this.content);
      setTimeout(() => {
        this.copied = false;
      }, 500);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.clipboard {
  position: relative;
  display: flex;
  align-items: center;

  &:hover {
    cursor: pointer;
  }

  svg {
    margin-right: 6px;
    width: 16px;
  }
}
</style>

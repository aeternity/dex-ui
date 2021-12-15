<template>
  <div class="settings-item">
    <div class="title">
      <span>{{ title }}</span>
      <ButtonTooltip v-bind="$attrs">
        ?
      </ButtonTooltip>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script>
import ButtonTooltip from './ButtonTooltip.vue';

export default {
  components: {
    ButtonTooltip,
  },
  props: {
    title: { type: String, required: true },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.settings-item {
  .title {
    margin: 12px 0;
    color: variables.$color-white2;

    @extend %face-sans-14-medium;

    .button-tooltip {
      color: white;
      margin-left: 8px;
    }
  }

  .content {
    display: flex;
    align-items: center;
    width: fit-content;
  }
}
</style>

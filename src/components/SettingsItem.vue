<template>
  <div class="settings-item">
    <div class="row">
      <div class="title">
        <span>{{ title }}</span>
      </div>
      <div class="content">
        <slot />
      </div>
    </div>
    <div>
      <div v-if="description" class="description">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: { type: String, required: true },
    description: { type: String, default: null },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';
@use '../styles/mixins.scss';

.settings-item {
  width: 100%;
  margin-top: 14px;

  .row {
    width: 100%;
    display: inline-flex;
    justify-content: space-between;
  }

  @include mixins.phone {
    .row {
      display: block;
    }
  }

  .title {
    margin: 12px 0;
    color: variables.$color-white;

    @extend %face-sans-16-medium;

    .button-tooltip {
      color: white;
      margin-left: 8px;
    }
  }

  .description {
    color: variables.$color-gray2;
    padding: 8px 0;
    white-space: initial;

    @extend %face-sans-14-regular;
  }

  .content {
    display: flex;
    align-items: center;
    width: fit-content;
  }
}
</style>

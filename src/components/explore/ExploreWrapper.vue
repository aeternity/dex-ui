<template>
  <div class="explore-wrapper">
    <slot />
  </div>
</template>
<script>
export default {
  name: 'ExploreWrapper',
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables.scss';
@use '../../styles/typography.scss';
@use '../../styles/mixins.scss';

.explore-wrapper {
  display: flex;
  flex-direction: column;
  margin: 4vh auto 0;
  border-radius: 24px;
  max-width: 1280px;
  background: variables.$color-black3;
  box-shadow:
    rgb(0 0 0 / 1%) 0 0 1px,
    rgb(0 0 0 / 4%) 0 4px 8px,
    rgb(0 0 0 / 4%) 0 16px 24px,
    rgb(0 0 0 / 1%) 0 24px 32px;
  color: white;
}
</style>

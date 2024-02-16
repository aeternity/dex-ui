<template>
  <label for="input-range" />
  <input
    id="input-range"
    class="input-range"
    v-bind="$attrs"
    type="range"
    min="0"
    max="100"
    step="1"
    @input="$emit('update', $event.target.value)"
  >
</template>

<script>
export default {
  emits: ['update'],
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

input[type='range'] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;

  &:focus {
    outline: none;
  }

  &:focus::-webkit-slider-runnable-track,
  &::-ms-fill-lower,
  &::-ms-fill-upper,
  &:focus::-ms-fill-lower,
  &:focus::-ms-fill-upper {
    background: variables.$color-gray2;
  }

  &::-moz-range-track {
    width: 100%;
    height: 2px;
    cursor: pointer;
    background: variables.$color-gray2;
  }

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 2px;
    cursor: pointer;
    background: variables.$color-gray2;
  }

  &::-ms-track {
    width: 100%;
    height: 2px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }

  &::-webkit-slider-thumb {
    height: 22px;
    width: 22px;
    border-radius: 12px;
    border: none;
    background: variables.$color-primary;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -10px;
  }

  &::-moz-range-thumb {
    height: 22px;
    width: 22px;
    border-radius: 12px;
    border: none;
    background: variables.$color-primary;
    cursor: pointer;
  }

  &::-ms-thumb {
    margin-top: 1px;
    height: 22px;
    width: 22px;
    border-radius: 12px;
    border: none;
    background: variables.$color-primary;
    cursor: pointer;
  }
}
</style>

<template>
  <ButtonPlain
    v-bind="$attrs"
    :class="[fill, 'button-default']"
  >
    <img
      v-if="spinner"
      src="../assets/animated-spinner.svg"
      class="spinner"
    >
    <slot v-else />
  </ButtonPlain>
</template>

<script>
import ButtonPlain from './ButtonPlain.vue';

export default {
  components: {
    ButtonPlain,
  },
  props: {
    fill: {
      type: String,
      validator: (value) => [
        'transparent-blue',
        'blue',
        'dark',
        'transparent',
        'plain',
      ].includes(value),
      default() {
        return 'blue';
      },
    },
    spinner: Boolean,
  },
};
</script>

<style lang="scss" scoped>
.button-default {
  border-radius: 12px;
  color: white;

  &.blue {
    background-color: rgb(33, 114, 229);

    &:hover {
      background-color: rgb(25, 102, 212);
    }
  }

  &.transparent {
    background-color: transparent;
    border:1px solid rgb(44, 47, 54);

    &:hover {
      box-shadow: rgb(86 90 105) 0px 0px 0px 1px;
    }
  }

  &.transparent-blue {
    border: 1px solid rgba(21, 61, 111, 0.44);
    color: rgb(80, 144, 234);
    background-color: rgba(21, 61, 111, 0.44);

    &:active {
      box-shadow: rgb(55 107 173 / 44%) 0px 0px 0px 1pt;
    }

    &:hover {
      border: 1px solid rgba(49, 95, 154, 0.44);
      color: rgb(57, 130, 231);
    }
  }

  &.dark {
    background: rgb(25, 27, 31);

    &:hover {
      background-color: rgb(44, 47, 54);
    }

    &:active {
      background-color: rgb(21, 23, 26);
    }
  }

  &:disabled {
    background-color: rgb(44, 47, 54);
    color: rgb(195, 197, 203);
    pointer-events: none;
  }

  .spinner {
    height: 20px;
    width: 20px;
  }
}
</style>

<template>
  <Transition appear name="fade">
    <div class="notification-default">
      <ButtonPlain @click="resolve">
        <Close />
      </ButtonPlain>
      <div class="content">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<script>
import Close from '@/assets/times.svg';
import ButtonPlain from './ButtonPlain.vue';

export default {
  components: { ButtonPlain, Close },
  props: {
    resolve: { type: Function, required: true },
    close: { type: Boolean },
  },
  mounted() {
    setTimeout(() => this.resolve(), 10000);
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.notification-default {
  width: 320px;
  padding: 5px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 10px;
  border-radius: 8px;
  text-align: right;
  background-color: variables.$color-black3;

  > .button-plain svg {
    width: 24px;
    height: 24px;
  }

  &.fade-enter-active,
  &.fade-leave-active {
    transition: opacity 0.25s ease-out;
  }

  &.fade-enter,
  &.fade-leave-to {
    opacity: 0;
  }

  .content {
    margin-top: -20px;
    overflow-wrap: break-word;
    padding: 5px 16px;
  }
}
</style>

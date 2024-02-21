<template>
  <NotificationDefault v-bind="$attrs" close class="notification-connection-status">
    <span>{{ text }}</span>
  </NotificationDefault>
</template>

<script>
import NotificationDefault from './NotificationDefault.vue';

export default {
  components: { NotificationDefault },
  props: {
    text: { type: String, required: true },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.notification-connection-status {
  position: fixed;
  bottom: 35%;
  right: 1%;
  background-color: variables.$color-orange;

  :deep(.content) {
    text-align: left;
  }
}
</style>

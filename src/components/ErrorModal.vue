<template>
  <ModalDefault
    class="error-modal"
    title="Error"
    @close="resolve"
  >
    <div class="error-details">
      <Alert />
      <h4>{{ message }}</h4>
    </div>
    <ButtonDefault
      fill="primary"
      :disabled="!resolve"
      @click="resolve"
    >
      {{ dismissText }}
    </ButtonDefault>
  </ModalDefault>
</template>

<script>
import ModalDefault from './ModalDefault.vue';
import ButtonDefault from './ButtonDefault.vue';
import Alert from '../assets/alert.svg?vue-component';

export default {
  name: 'ErrorModal',
  components: {
    ModalDefault,
    ButtonDefault,
    Alert,
  },
  props: {
    message: { type: String, required: true },
    resolve: { type: Function, default: null },
    dismissText: { type: String, default: 'Dismiss' },
  },
};
</script>

<style lang="scss" scoped>
.error-modal {
  .error-details {
    padding: 20px 30px;
    max-width: 480px;

    svg {
      width: 50px;
    }

    h4 {
      color: white;
      margin-top: 5px;
    }
  }

  .button-default {
    padding: 8px 16px;
    margin-bottom: 20px;
    font-size: 18px;
  }
}
</style>

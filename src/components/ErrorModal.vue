<template>
  <ModalDefault class="error-modal" :title="$t('error')" @close="resolve">
    <div class="error-details">
      <Alert />
      <h4>{{ message }}</h4>
    </div>
    <ButtonDefault fill="primary" :disabled="!resolve" data-cy="error-dismiss" @click="resolve">
      {{ dismissText || $t('dismiss') }}
    </ButtonDefault>
  </ModalDefault>
</template>

<script>
import Alert from '@/assets/alert.svg';
import ModalDefault from './ModalDefault.vue';
import ButtonDefault from './ButtonDefault.vue';

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
    dismissText: { type: String, default: '' },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';

.error-modal {
  .error-details {
    padding: 20px 30px;
    max-width: 440px;

    svg {
      width: 50px;
      color: variables.$color-orange;
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

<template>
  <div class="input-token">
    <div class="token-amount">
      <ButtonToken v-bind="$attrs" arrow />
      <InputField
        v-bind="$attrs"
        type="number"
        placeholder="0.0"
        @update:value="$emit('update:value', $event)"
      />
    </div>
    <div v-if="$attrs.token && address" class="balance">
      <span
        >{{ $t('swap.balance') }}:
        <AeBalance :address="contractId" @update:balance="updateBalance($event)" />
        {{ $attrs.token.symbol }}
      </span>
      <ButtonPlain v-if="+balance" @click="setMax"> ({{ $t('max') }}) </ButtonPlain>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import InputField from './InputField.vue';
import ButtonToken from './ButtonToken.vue';
import ButtonPlain from './ButtonPlain.vue';
import AeBalance from './AeBalance.vue';

export default {
  components: {
    InputField,
    ButtonToken,
    ButtonPlain,
    AeBalance,
  },
  emits: ['update:value', 'update:balance'],
  data: () => ({
    balance: '',
  }),
  computed: {
    ...mapState(['address']),
    contractId() {
      return this.$attrs.token.is_ae ? this.address : this.$attrs.token.contract_id;
    },
  },
  methods: {
    async setMax() {
      this.$emit('update:value', this.balance);
    },
    updateBalance(event) {
      this.balance = event.toString();
      this.$emit('update:balance', event);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables.scss';
@use '../styles/typography.scss';

.input-token {
  display: flex;
  flex-direction: column;
  background: variables.$color-black2;
  border-radius: 20px;
  border: 2px solid variables.$color-black2;
  padding: 16px;

  &:hover {
    border-color: variables.$color-gray-hover;
  }

  .token-amount {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .button-token {
      width: initial;
      padding: 6px 8px;
    }

    .input-field {
      font-size: 24px;
    }
  }

  .balance {
    color: variables.$color-white2;
    padding: 0 16px;
    text-align: left;
    padding-top: 12px;

    > span {
      @extend %face-sans-14-regular;
    }

    .button-plain {
      margin-left: 4px;
      font-weight: 500;
      color: variables.$color-primary;
    }
  }
}
</style>

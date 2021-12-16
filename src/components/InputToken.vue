<template>
  <div class="input-token">
    <div class="token-amount">
      <ButtonToken
        v-bind="$attrs"
        arrow
      >
        <template #icon>
          <img src="../assets/logo.png">
        </template>
      </ButtonToken>
      <InputField
        v-bind="$attrs"
        type="number"
        placeholder="0.0"
        @update:value="$emit('update:value', $event)"
      />
    </div>
    <div
      v-if="$attrs.token && address"
      class="balance"
    >
      <span>Balance:
        <AeBalance
          :address="$attrs.token.contract_id"
          @update:balance="updateBalance($event)"
        />
        {{ $attrs.token.symbol }}
      </span>
      <ButtonPlain
        v-if="+balance"
        @click="setMax"
      >
        (Max)
      </ButtonPlain>
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
  computed: mapState(['address']),
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
.input-token {
  display: flex;
  flex-direction: column;
  background: rgb(33, 36, 41);
  border-radius: 20px;
  border: 1px solid rgb(44, 47, 54);
  padding: 16px;

  .token-amount {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;

    .button-token {
      width: initial;
      padding: 6px 8px;
    }

    .input-field {
      font-size: 24px;
    }
  }

  .balance {
    color: rgb(195, 197, 203);
    padding: 0 16px;
    text-align: left;

    > span {
      font-weight: 400;
      font-size: 14px;
    }

    .button-plain {
      margin-left: 4px;
      font-weight: 500;
      color: rgb(80, 144, 234);
    }
  }
}
</style>

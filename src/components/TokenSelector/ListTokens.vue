<template>
  <div class="list-tokens">
    <div
      v-if="expandedList"
      class="expanded-tokens-list"
    >
      Expanded results from inactive Token Lists

      <ActionsMenu>
        <template #display>
          <QuestionCircleIcon />
        </template>
        <div>
          Tokens from an active lists.
          Import specific tokens below or click manage to add custom tokens.
        </div>
      </ActionsMenu>
    </div>

    <ButtonPlain
      v-for="token in tokens"
      :key="`${token.contract_id}|${token.symbol}`"
      :class="['token', {
        'clickable': !importToken,
        selected: (chosenTokens?.[0] || chosenTokens?.[1]) && !!chosenTokens.find(
          (t) => token.symbol === t?.symbol && token.contract_id === t?.contract_id,
        )
      }]"
      :disabled="chosenTokens?.[0] && (chosenTokens[0]?.contract_id === token.contract_id
        && chosenTokens[0]?.symbol === token.symbol)"
      @click.prevent="!importToken ? $emit('token:click', token) : null"
    >
      <div class="wrapper">
        <div class="row">
          <img :src="token.image ?? `https://avatars.z52da5wt.xyz/${token.contract_id}`">
          <div class="info">
            <span class="symbol">
              {{ token.symbol }}
            </span>
            <span class="name">
              {{ token.name }}
              {{ token.custom ? '• Added by user': '' }}
            </span>
          </div>
        </div>
        <div v-if="importToken">
          <div
            v-if="!!activeTokens.filter(t => t.contract_id === token.contract_id).length"
            class="active-token"
          >
            Active
          </div>

          <ButtonDefault
            v-else
            class="import-button"
            @click.prevent="$emit('token:import', token)"
          >
            Import
          </ButtonDefault>
        </div>
      </div>
    </ButtonPlain>
  </div>
</template>

<script>
import ButtonPlain from '../ButtonPlain.vue';
import ButtonDefault from '../ButtonDefault.vue';
import ActionsMenu from '../ActionsMenu.vue';
import QuestionCircleIcon from '../../assets/question-circle.svg?vue-component';

export default {
  components: {
    ButtonDefault,
    ButtonPlain,
    ActionsMenu,
    QuestionCircleIcon,
  },
  props: {
    tokens: {
      type: Array,
      required: true,
    },
    activeTokens: {
      type: Array,
      default: () => ([]),
    },
    expandedList: {
      type: Boolean,
      default: false,
    },
    importToken: {
      type: Boolean,
      default: false,
    },
    chosenTokens: { type: Array, default: null },
  },
  emits: ['token:click', 'token:import'],
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables.scss';
@use '../../styles/typography.scss';
@use './style.scss';

.list-tokens {
  display: flex;
  flex-direction: column;

  &.custom-list {
    padding-bottom: 10px;

    .wrapper {
      padding: 10px 15px;
      background-color: variables.$color-black2;
      border-radius: 12px;
    }
  }

  .expanded-tokens-list {
    margin: 18px;
    padding: 12px 20px;
    border-radius: 10px;
    background-color: variables.$color-black;
    color: variables.$color-white;
    display: flex;
    align-items: center;
    justify-content: space-between;

    @extend %face-sans-14-regular;

    .actions-menu {
      :deep(.small-modal > .content) {
        border: 1px solid variables.$color-black2;
        top: 0;
        right: 15px;
        width: 200px;
        white-space: normal;
        padding: 8px;
        line-height: 24px;

        @extend %face-sans-16-regular;
      }
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
}

</style>

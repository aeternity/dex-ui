<template>
  <div class="list-tokens">
    <div
      v-if="expandedList"
      class="expanded-tokens-list"
    >
      {{ $t('tokenSelector.expandedInactiveTokenLists') }}
      <ActionsMenu>
        <template #display>
          <QuestionCircleIcon />
        </template>
        <div>
          {{ $t('tokenSelector.importSpecificTokensOrManageCustoms') }}
        </div>
      </ActionsMenu>
    </div>

    <ButtonPlain
      v-for="token in tokens"
      :key="`${token.contract_id}|${token.symbol}`"
      :class="['token', {
        clickable: !importToken,
        selected: (chosenTokens?.[0] || chosenTokens?.[1]) && !!chosenTokens.find(
          (t) => token.symbol === t?.symbol && token.contract_id === t?.contract_id,
        ),
      }]"
      :disabled="chosenTokens?.[0] && (chosenTokens[0]?.contract_id === token.contract_id
        && chosenTokens[0]?.symbol === token.symbol)"
      @click.prevent="!importToken ? $emit('token:click', token) : null"
    >
      <div class="wrapper">
        <div class="row">
          <TokenIcon :token-a="token" />
          <div class="info">
            <span class="symbol">
              {{ token.symbol }}
            </span>
            <span class="name">
              {{ token.name }}
              {{ token.custom ? $t('tokenSelector.addedByUser') : '' }}
            </span>
          </div>
        </div>
        <div v-if="importToken">
          <div
            v-if="!!activeTokens.filter(t => t.contract_id === token.contract_id).length"
            class="active-token"
          >
            {{ $t('active') }}
          </div>

          <ButtonDefault
            v-else
            class="import-button"
            @click.prevent="$emit('token:import', token)"
          >
            {{ $t('import') }}
          </ButtonDefault>
        </div>
      </div>
    </ButtonPlain>
  </div>
</template>

<script>
import QuestionCircleIcon from '@/assets/question-circle.svg';
import ButtonPlain from '../ButtonPlain.vue';
import ButtonDefault from '../ButtonDefault.vue';
import TokenIcon from '../TokenIcon.vue';
import ActionsMenu from '../ActionsMenu.vue';

export default {
  components: {
    ButtonDefault,
    ButtonPlain,
    ActionsMenu,
    QuestionCircleIcon,
    TokenIcon,
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

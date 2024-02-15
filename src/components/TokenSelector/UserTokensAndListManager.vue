<template>
  <div>
    <div class="toggle">
      <div
        :class="['option', { active: tab === 'lists' }]"
        @click.prevent="tab = 'lists'"
        @keydown.prevent="tab = 'lists'"
      >
        {{ $t('lists') }}
      </div>
      <div
        :class="['option', { active: tab === 'custom' }]"
        @click.prevent="tab = 'custom'"
        @keydown.prevent="tab = 'custom'"
      >
        {{ $t('custom') }}
      </div>
    </div>

    <TokenListManager
      v-if="tab === 'lists'"
      v-bind="$attrs"
    />
    <UserCustomTokensManager
      v-if="tab === 'custom'"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import TokenListManager from './TokenListManager.vue';
import UserCustomTokensManager from './UserCustomTokensManager.vue';

export default {
  components: {
    TokenListManager,
    UserCustomTokensManager,
  },
  data: () => ({
    tab: 'lists',
  }),
};
</script>

<style lang="scss" scoped>
@use '../../styles/variables.scss';
@use '../../styles/typography.scss';

.toggle {
  max-width: 250px;
  margin: 0 auto;
  padding: 4px;
  border-radius: 16px;
  background-color: variables.$color-black2;
  flex: 1;
  display: flex;
  justify-content: space-around;

  .option {
    flex: 1;
    border-radius: 12px;
    padding: 7px 8px;
    color: variables.$color-white;

    @extend %face-sans-16-medium;

    &:hover {
      cursor: pointer;
    }

    &.active {
      background-color: variables.$color-gray3;
    }
  }
}
</style>

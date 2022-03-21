<template>
  <div>
    <div class="toggle">
      <div
        :class="{
          'option': true,
          'active': tab === 'lists'
        }"
        @click.prevent="tab = 'lists'"
      >
        Lists
      </div>
      <div
        :class="{
          'option': true,
          'active': tab === 'tokens'
        }"
        @click.prevent="tab = 'tokens'"
      >
        Tokens
      </div>
    </div>

    <TokensListsManager
      v-if="tab === 'lists'"
      v-bind="$attrs"
    />
    <UserTokensManager
      v-if="tab === 'tokens'"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import TokensListsManager from './TokensListsManager.vue';
import UserTokensManager from './UserTokensManager.vue';

export default {
  components: {
    TokensListsManager,
    UserTokensManager,
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
  margin: 12px 20px;
  border-radius: 8px;
  background-color: variables.$color-gray;
  flex: 1;
  display: flex;
  justify-content: space-around;

  .option {
    flex: 1;
    margin: 6px;
    border-radius: 8px;
    padding: 10px 0;
    color: variables.$color-white;

    @extend %face-sans-16-medium;

    &:hover {
      cursor: pointer;
    }

    &.active {
      background-color: variables.$color-black;
    }
  }
}

</style>

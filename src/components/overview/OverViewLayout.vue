<template>
  <div class="overview-layout">
    <div class="container">
      <div class="sidebar">
        <router-link
          to="/overview"
        >
          Overview
        </router-link>

        <router-link
          to="/overview/pools"
        >
          Pools
        </router-link>

        <router-link
          to="/overview/tokens"
        >
          Tokens
        </router-link>
      </div>
      <div class="content">
        <div
          v-if="false"
          class="input-wrapper"
        >
          <InputField
            v-model:value="searchTerm"
            placeholder="Search name or paste address"
            class="search-bar"
          />
        </div>
        <router-view />
      </div>
    </div>
  </div>
</template>
<script>
import InputField from '../InputField.vue';

export default {
  components: {
    InputField,
  },
  data() {
    return {
      searchTerm: '',
    };
  },
};
</script>
<style lang="scss" scoped>
  @use '../../styles/variables.scss';
  @use '../../styles/typography.scss';
  @use '../../styles/mixins.scss';

  .overview-layout {
    background-color: variables.$color-black;
    border: 1px solid variables.$color-gray;
    border-radius: 12px;
    margin-top: 16px;
    min-height: 80%;
    max-width: 1200px;
    margin: 16px auto;
    margin-bottom: 100px;
    min-height: 80%;
    color: variables.$color-white;

    .container {
      width: 100%;
      height: 100%;
      display: inline-flex;

      .sidebar {
        min-width: 250px;
        background-color: variables.$color-black2;
        border-right: 1px solid variables.$color-gray;
        padding: 16px 0;
        text-align: left;

        a {
          display: block;
          text-decoration: none;
          color: variables.$color-gray2;
          padding: 8px 16px;

          &.router-link-exact-active {
            background-color: variables.$color-gray;
            color: variables.$color-white;
          }

          &:hover {
            background-color: variables.$color-gray;
          }
        }
      }

      .content {
        padding: 16px;
        flex: 1;
        .input-wrapper {
          margin: 12px;

          .search-bar {
            font-size: 18px;
            text-align: left;
            padding: 12px;
            border-radius: 20px;
            color: white;
            border: 1px solid variables.$color-gray;
            background-color: variables.$color-black2;
            transition: border 100ms ease 0s;

            &:focus {
              border: 1px solid variables.$color-blue;
            }
          }
        }
      }
    }

    @include mixins.phone {
      .container {
        display: block;

        .sidebar {
          padding: 16px;
          border-right: none;
        }
      }
    }
  }

</style>

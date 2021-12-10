<template>
  <nav class="navigation-menu">
    <router-link to="/swap">
      Swap
    </router-link>
    <router-link to="/pool">
      Pool
    </router-link>
  </nav>
</template>

<style lang="scss" scoped>
.navigation-menu {
  display: flex;
  border-radius: 16px;
  background: rgb(25, 27, 31);
  padding: 4px;
  border: 1px solid rgb(44, 47, 54);

  a {
    color: rgb(195, 197, 203);
    padding: 8px 12px;
    text-decoration: none;

    &:not(:last-of-type) {
      margin-right: 10px;
    }

    &:hover {
      color: white
    }

    &.router-link-active {
      border-radius: 12px;
      color: white;
      background-color: rgb(44, 47, 54);
    }
  }
}
</style>

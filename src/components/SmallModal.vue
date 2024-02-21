<template>
  <div class="small-modal">
    <div class="overlay" @click.stop="$emit('close')" @keydown.stop="$emit('close')" />
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.small-modal {
  .overlay {
    position: fixed;
    inset: 0;
  }

  .content {
    position: absolute;
  }
}
</style>

<template>
  <div class="navbar">
    <NuxtLink to="/">
      <h1 class="text-xl">Rika 工具箱</h1>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.navbar {
  @apply h-12 bg-gray-100 dark:bg-gray-900 flex items-center px-4 gap-4 shadow-md;
}
</style>

<template>
  <div class="navbar">
    <button
      @click="sidebarActive = !sidebarActive"
      class="bg-transparent border-none p-1 2xl:hidden"
    >
      <Icon name="mdi:menu" />
    </button>
    <NuxtLink to="/">
      <h1 class="text-xl">Rika 工具箱</h1>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ sidebarActive: boolean }>();
const sidebarActive = useVModel(props, "sidebarActive");
</script>

<style scoped>
.navbar {
  @apply h-12 bg-gray-100 flex items-center px-4 gap-4 shadow-md;
}
</style>

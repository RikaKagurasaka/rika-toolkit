<template>
  <div class="grid grid-rows-[auto_1fr] grid-cols-[auto_1fr] h-screen gap-2">
    <Navbar class="col-span-full" v-model:sidebar-active="sidebarActive" />
    <Sidebar :sidebar-active="sidebarActive" />
    <div class="overflow-y-auto">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarActive = ref(false);
</script>

<style scoped></style>

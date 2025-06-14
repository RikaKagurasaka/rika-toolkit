<template>
  <div class="sidebar">
    <ul>
      <li>
        <Icon name="mdi:unicode" />
        <NuxtLink to="/wide-decoder">通用解码器</NuxtLink>
      </li>
      <li>
        <Icon name="mdi:calculator" />
        <NuxtLink to="/continued-fraction">连分数近似</NuxtLink>
      </li>
      <li>
        <Icon name="mdi:music" />
        <NuxtLink to="/chord-grid">和弦网格</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.sidebar {
  @apply bg-gray-100 dark:bg-gray-900 h-full overflow-y-auto shadow-lg;
  @apply w-0 md:w-64;

  & > ul {
    @apply list-none p-4 m-0;

    & > li {
      @apply p-2 text-lg hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md cursor-pointer flex items-center gap-2 justify-start items-center;

      & > a {
        @apply block w-full h-full;
      }
    }
  }
}
</style>

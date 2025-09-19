<template>
  <div
    class="sidebar"
    :class="{ 'w-64': sidebarActive, 'w-0': !sidebarActive }"
  >
    <ul>
      <li
        v-for="r in routes"
        :key="r.name"
        :class="{ 'bg-gray-300': r.path === route.path }"
        @click="router.push(r.path)"
      >
        <Icon :name="r.icon" />
        <span class="block w-full h-full">{{ r.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const { sidebarActive } = defineProps<{ sidebarActive: boolean }>();
const routes = [
  { name: "通用解码器", path: "/tool-wide-decoder", icon: "mdi:unicode" },
  {
    name: "连分数近似",
    path: "/tool-continued-fraction",
    icon: "mdi:calculator",
  },
  { name: "和弦网格", path: "/tool-chord-grid", icon: "mdi:music" },
  { name: "乐理研究", path: "/tool-music-research", icon: "mdi:music" },
];
const route = useRoute();
</script>

<style scoped>
.sidebar {
  @apply bg-gray-100 h-full overflow-y-auto overflow-x-hidden shadow-lg;
  @apply 2xl:w-64 transition-all duration-150;

  & > ul {
    @apply list-none p-4 m-0;

    & > li {
      @apply p-2 text-lg;
      @apply hover:bg-gray-200;
      @apply cursor-pointer;
      @apply rounded-md;
      @apply flex items-center gap-2 justify-start items-center;
      @apply transition-colors duration-200;
    }
  }
}
</style>

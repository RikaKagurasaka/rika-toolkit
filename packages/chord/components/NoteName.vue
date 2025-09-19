<script setup lang="tsx">
import { NOTES } from '../utils';
import SingleNote from './SingleNote.vue';

const { level, name } = defineProps<{
  level?: number;
  name?: string;
}>();
const names = computed(() => {
  return name ? name.split("/") : NOTES[level ?? 0]?.split("/");
});
</script>

<template>
  <div class="note-name">
    <SingleNote v-for="name in names" :key="name" :name="name" />
  </div>
</template>

<style lang="scss">
.note-name {
  @apply flex items-center justify-center flex-nowrap;
}
</style>

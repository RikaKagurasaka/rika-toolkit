<script setup lang="tsx">
const { level, name } = defineProps<{
  level?: number;
  name?: string;
}>();
const names = computed(() => {
  return name ? name.split("/") : NOTES[level ?? 0].split("/");
});
</script>

<template>
  <div class="note-name">
    <ChordSingleNote v-for="name in names" :key="name" :name="name" />
  </div>
</template>

<style lang="scss">
.note-name {
  @apply flex items-center justify-center flex-nowrap;
}
</style>

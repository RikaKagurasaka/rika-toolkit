<script setup lang="ts">
const { x, y, mainNoteLevel } = defineProps<{
  x: number;
  y: number;
  mainNoteLevel: number;
}>();
const emit = defineEmits<{
  (e: "click", x: number, y: number): void;
}>();
</script>

<template>
  <div
    class="note-grid-cell"
    :style="{
      gridColumnStart: x + 7,
      gridRowStart: -y + 3,
    }"
    @click="emit('click', x, y)"
  >
    <ChordNoteName :level="coords2level(x, y, mainNoteLevel)" />
  </div>
</template>

<style lang="scss" scoped>
.note-grid-cell {
  @apply flex items-center justify-center flex-col w-full h-full;
  @apply bg-amber-100 rounded select-none cursor-pointer hover:shadow-md transition-shadow duration-300;
}
</style>

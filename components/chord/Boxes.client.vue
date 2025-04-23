<script setup lang="ts">
const { $gsap } = useNuxtApp();
const { unifiedChord, gridSizing } = defineProps<{
  unifiedChord: { w: number; x: number; y: number }[];
  gridSizing: {
    cellSize: number;
    gap: number;
    headerSize: number;
  };
}>();
const boxCoords = computed(() => {
  return unifiedChord.map((note) => {
    const { headerSize, cellSize, gap } = gridSizing;
    return {
      left: headerSize + (cellSize + gap) * (note.x + 5) + gap,
      top: headerSize + (cellSize + gap) * (-note.y + 1) + gap,
      width: cellSize,
      height: cellSize,
      note: note,
    };
  });
});
const boxes = ref<HTMLDivElement[]>([]);
watch(
  [boxCoords, boxes],
  async () => {
    await nextTick();
    for (let i = 0; i < boxCoords.value.length; i++) {
      boxes.value[i] &&
        $gsap.to(boxes.value[i], {
          duration: 0.2,
          x: boxCoords.value[i].left,
          y: boxCoords.value[i].top,
          width: boxCoords.value[i].width,
          height: boxCoords.value[i].height,
          ease: "power2.inOut",
        });
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
</script>

<template>
  <div v-for="(box, i) in boxCoords" :style="box" class="box" ref="boxes">
    <Icon
      v-if="i == 0"
      name="mdi:triangle-outline"
      class="text-blue-800 rotate-90 text-xs absolute top-1 left-1"
    />
    <ChordLamplightIcon
      v-if="box.note.w == 1"
      :w="box.note.w"
      class="absolute top-1 right-1 text-xs"
    />
  </div>
</template>

<style lang="scss" scoped>
.box {
  @apply absolute pointer-events-none;
  @apply border-3 border-blue-800;
}
</style>

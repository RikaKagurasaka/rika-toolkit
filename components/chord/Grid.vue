<script setup lang="ts">
const { mainNoteLevel, gridSizing } = defineProps<{
  mainNoteLevel: number;
  gridSizing: {
    cellSize: number;
    gap: number;
    headerSize: number;
  };
}>();
const emit = defineEmits<{
  (e: "click", x: number, y: number): void;
}>();
</script>

<template>
  <div
    class="grid relative"
    :style="{
      gridTemplateColumns: `${gridSizing.headerSize}px repeat(13,${gridSizing.cellSize}px)`,
      gridTemplateRows: `${gridSizing.headerSize}px repeat(3,${gridSizing.cellSize}px)`,
      gap: `${gridSizing.gap}px`,
    }"
  >
    <ChordLamplightIcon
      v-for="(x, i) in noteCoordsRange.x"
      :key="`x-${x}`"
      :x="x"
      :y="0"
      :style="{
        gridColumnStart: i + 2,
        gridRowStart: 1,
      }"
    />
    <ChordLamplightIcon
      v-for="(y, i) in noteCoordsRange.y"
      :key="`y-${y}`"
      :x="0"
      :y="y"
      :style="{
        gridColumnStart: 1,
        gridRowStart: -i + 4,
      }"
    />
    <template v-for="x in noteCoordsRange.x" :key="`x-${x}`">
      <template v-for="y in noteCoordsRange.y" :key="`y-${y}`">
        <ChordGridCell
          :x="x"
          :y="y"
          :mainNoteLevel="mainNoteLevel"
          @click="emit('click', x, y)"
        />
      </template>
    </template>
    <slot />
  </div>
</template>

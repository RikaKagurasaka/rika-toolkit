<script setup lang="ts">
import { ChordGrid } from "chord";
const componentDict = Object.fromEntries(
  [
    ["chord-grid", () => import("chord").then((m) => m.ChordGrid)],
    [
      "continued-fraction",
      () => import("continued-fraction").then((m) => m.ContinuedFraction),
    ],
    ["wide-decoder", () => import("wide-decoder").then((m) => m.WideDecoder)],
    [
      "music-research",
      () => import("music-research").then((m) => m.MusicResearch),
    ],
  ].map(([name, loader]) => [name, defineAsyncComponent(loader as any)])
);

const route = useRoute();
</script>

<template>
  <component
    :is="componentDict[route.params.tool as keyof typeof componentDict]"
  />
</template>

<style lang="scss" scoped></style>

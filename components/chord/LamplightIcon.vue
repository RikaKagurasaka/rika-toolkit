<script setup lang="tsx">
const {
  x = 0,
  y = 0,
  w = 0,
} = defineProps<{
  w?: number;
  x?: number;
  y?: number;
}>();
const upArrow = "ꜛ";
const downArrow = "ꜜ";
const RenderArrow = ({ i }: { i: number }) => {
  const arrow = i > 0 ? upArrow : downArrow;
  const sign =
    i > 0 ? (
      <sup class="font-sans">{i}</sup>
    ) : (
      <sub class="font-sans">{-i}</sub>
    );
  if (Math.abs(i) <= 3) {
    return ["", arrow.repeat(Math.abs(i))];
  }
  return [sign, arrow];
};
</script>

<template>
  <div class="lamplight-icon">
    <div v-if="w != 0">
      <span class="font-Qoz text-chord-1d">1 <RenderArrow :i="w" /></span>
    </div>
    <div v-if="x != 0">
      <span class="font-Qoz text-chord-2d">2 <RenderArrow :i="x" /></span>
    </div>
    <div v-if="y != 0">
      <span class="font-Qoz text-chord-3d">3 <RenderArrow :i="y" /></span>
    </div>
    <div v-if="x == 0 && y == 0 && w == 0">
      <span class="font-Qoz text-chord-0d">0</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.font-Qoz {
  font-family: "Qoz";
}
.lamplight-icon {
  @apply flex items-center justify-center flex-nowrap;
}
</style>

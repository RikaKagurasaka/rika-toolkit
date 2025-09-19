<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as d3 from "d3";
import { curvePoints } from "../composables/rxCurve";
import { useElementBounding, watchDeep } from "@vueuse/core";
import { useConfig } from "../composables/config";
const svg = ref<SVGSVGElement | null>(null);
const { width, height } = useElementBounding(svg);
const { r, t } = useConfig();
const MARGIN = 8;
function plot() {
  if (!svg.value) return;
  const x = d3
    .scaleLinear()
    .domain([0, curvePoints.value.length])
    .range([MARGIN, width.value - MARGIN]);
  const y = d3
    .scaleLinear()
    .domain([0, 1])
    .range([height.value - MARGIN, MARGIN]);
  const line = d3
    .line<{ x: number; y: number }>()
    .x((d) => x(d.x))
    .y((d) => y(d.y));
  d3.select(svg.value).selectAll("*").remove();
  const g = d3.select(svg.value).append("g");
  g.append("path")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      line(curvePoints.value.map((p, index) => ({ x: index, y: p }))) || ""
    );
}

watchDeep(
  [width, height, r, t],
  () => {
    plot();
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <h2 class="text-lg font-bold mb-4">基本不和谐度曲线</h2>
    <div class="flex gap-8 mb-4 items-start">
      <div class="grid grid-cols-[4em_8em] gap-1 max-w-lg">
        <span>参数r</span>
        <input v-model.number="r" type="number" class="input" />
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          v-model.number="r"
          class="grid-col-span-2"
        />
        <span>参数t</span>
        <input v-model.number="t" type="number" class="input" />
        <input
          type="range"
          min="10"
          max="200"
          step="10"
          v-model.number="t"
          class="grid-col-span-2"
        />
      </div>
      <svg ref="svg" class="w-32 h-32 border shadow box-content" />
    </div>
  </div>
</template>

<style lang="css" scoped></style>

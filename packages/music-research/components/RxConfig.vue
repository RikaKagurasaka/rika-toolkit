<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as d3 from "d3";
import { curvePoints } from "../composables/rxCurve";
import { useElementBounding, watchDeep } from "@vueuse/core";
import { useConfig } from "../composables/config";
import Control from "./comp/Control.vue";
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
    <h2 class="text-lg font-bold mb-2">基本不和谐度曲线</h2>
    <div class="flex gap-8 mb-4 items-center">
      <div class="flex gap-2 flex-col max-w-lg">
        <Control
          label="参数r"
          v-model:value="r"
          :min="5"
          :max="100"
          :step="5"
          :options="[5, 10, 25, 50, 100]"
        ></Control>
        <Control
          label="参数t"
          v-model:value="t"
          :min="10"
          :max="200"
          :step="5"
          :options="[10, 25, 50, 100, 200]"
        ></Control>
      </div>
      <svg ref="svg" class="w-32 h-full border shadow box-content" />
    </div>
  </div>
</template>

<style lang="css" scoped></style>

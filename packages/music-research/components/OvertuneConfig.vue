<script setup lang="ts">
import { ref } from "vue";
import * as d3 from "d3";
import { useConfig } from "../composables/store";
import { useElementBounding, watchDeep } from "@vueuse/core";
import { overtuneData } from "../composables/overtune";
const svg = ref<SVGSVGElement | null>(null);
const { width, height } = useElementBounding(svg);
const MARGIN = 8;
const { formulaCent, formulaIntensity, maxI } = useConfig();

function plot() {
  if (!svg.value) return;
  const maxCent = overtuneData.value.reduce(
    (a, b) => (b.intensity ? Math.max(a, b.cent) : a),
    0
  );
  const maxIntensity = overtuneData.value.reduce(
    (a, b) => Math.max(a, b.intensity),
    0
  );
  const x = d3
    .scaleLinear()
    .domain([0, maxCent])
    .range([MARGIN, width.value - MARGIN]);
  const y = d3
    .scaleLinear()
    .domain([0, maxIntensity])
    .range([height.value - MARGIN, MARGIN]);

  d3.select(svg.value)
    .selectAll("line")
    .data(new Array(Math.floor(maxCent / 1200)).fill(0).map((_, i) => i + 1))
    .join("line")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .attr("x1", (d) => x(d * 1200))
    .attr("x2", (d) => x(d * 1200))
    .attr("y1", y(0))
    .attr("y2", y(maxIntensity));

  d3.select(svg.value)
    .selectAll("rect")
    .data(overtuneData.value)
    .join("rect")
    .attr("x", (d) => x(d.cent) - (x(50) - x(0)) / 2 || 0)
    .attr("y", (d) => y(d.intensity))
    .attr("height", (d) => y(0) - y(d.intensity))
    .attr("width", x(50) - x(0))
    .attr("fill", "steelblue");
}

watchDeep(
  [width, height, overtuneData],
  () => {
    plot();
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <h2 class="text-lg font-bold mb-4">泛音列</h2>
    <div class="flex gap-8 mb-4 items-start">
      <div class="grid grid-cols-[8em_8em] gap-1 max-w-lg">
        <span>泛音数量</span>
        <input v-model.number="maxI" type="number" class="input" />
        <input
          type="range"
          min="1"
          max="20"
          step="1"
          v-model.number="maxI"
          class="grid-col-span-2"
        />
        <span class="grid-col-span-2"
          >i 级泛音音高<span class="text-xs">/1200c</span></span
        >
        <input
          v-model="formulaCent"
          type="text"
          class="input w-full grid-col-span-2"
        />
        <span class="grid-col-span-2">i 级泛音强度</span>
        <input
          v-model="formulaIntensity"
          type="text"
          class="input w-full grid-col-span-2"
        />
      </div>
      <div class="flex flex-col">
        <svg ref="svg" class="w-72 h-full border shadow box-content" />
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped></style>

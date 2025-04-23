<template>
  <div class="p-8">
    <h1 class="text-2xl">连分数</h1>
    <div class="form-control">
      <label for="input">输入</label>
      <p class="text-sm text-gray-500">
        支持小数、分数、科学计数法 （小数以外的表示方法可能不精确）
      </p>
      <input id="input" v-model="input" class="input" />
    </div>
    <div class="form-control">
      <label for="input">最大迭代次数</label>
      <input
        id="input"
        v-model.number="maxIterations"
        type="number"
        class="input max-w-20"
      />
    </div>
    <ClientOnly>
      <div
        class="flex items-center gap-2 math flex-col"
        v-if="output.length > 0"
      >
        <h2>线性表达式</h2>
        <div v-html="linearExpression"></div>
        <h2>连分数表达式</h2>
        <div v-html="displayExpression"></div>
        <h2>近似分数列</h2>
        <div v-html="approximationExpression"></div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { continuedFraction } from "~/utils/continued-fraction";
import katex from "katex";
import "katex/dist/katex.min.css";
import Fraction from "fraction.js";
import { parseInput } from "~/utils/continued-fraction";

const input = useLocalStorage(
  "continuedFraction.input",
  "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679"
);
const maxIterations = useLocalStorage("continuedFraction.maxIterations", 10);
const isFinite = ref(false);
const parsedInput = computed(() => parseInput(input.value));
const output = computed(() => {
  if (parsedInput.value) {
    return continuedFraction(parsedInput.value, maxIterations.value, isFinite);
  }
  return [];
});
const linearExpression = computed(() => {
  let s = output.value.join(",");
  if (!isFinite.value) {
    s += ",\\cdots";
  }
  s = s.replace(/,/, ";");
  return katex.renderToString(`[${s}]`);
});
const displayExpression = computed(() => {
  let expression = "%";
  for (let i = 0; i < output.value.length; i++) {
    expression = expression.replace(
      "%",
      `\\displaystyle  ${output.value[i]} + \\frac{1}{%}`
    );
  }
  if (!isFinite.value) {
    expression = expression.replace("%", "\\ddots");
  } else {
    expression = expression.replace(" + \\frac{1}{%}", "");
  }
  return katex.renderToString(expression);
});

const approximation = computed(() => {
  if (output.value.length === 0) {
    return [];
  }
  const results = [];
  let p = 0,
    q = 1,
    pp = 1,
    qq = 0;
  for (let i = 0; i < output.value.length; i++) {
    let ppp = pp * output.value[i] + p;
    let qqq = qq * output.value[i] + q;
    [p, q, pp, qq] = [pp, qq, ppp, qqq];
    results.push(new Fraction(ppp, qqq));
  }
  return results;
});

const approximationExpression = computed(() => {
  return katex.renderToString(
    approximation.value
      .map((fraction) => `\\frac{${fraction.n}}{${fraction.d}}`)
      .join(",") + (isFinite.value ? "" : ",\\cdots"),
    {
      displayMode: true,
    }
  );
});
</script>

<style scoped>
.math {
  display: flex;
  align-items: center;
  gap: 1rem;
}
h2 {
  @apply text-lg font-bold;
}
</style>

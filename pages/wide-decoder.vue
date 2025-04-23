<template>
  <div class="p-8">
    <h1 class="text-2xl">通用解码器</h1>
    <p class="text-sm text-gray-500">
      一次性解码U码、url编码、十六进制、转义字符串、base64、十进制数组、十六进制数组
    </p>
    <div class="form-control">
      <label for="input">输入</label>
      <textarea id="input" v-model="input" class="textarea"></textarea>
    </div>
    <div class="form-control">
      <label for="output">输出</label>
      <textarea
        id="output"
        :value="output"
        class="textarea"
        readonly
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
const input = useLocalStorage(
  "wideDecoder.input",
  "b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd\\xe4\\xb8\\x96\\xe7\\x95\\x8c'"
);
const output = computed(() => wideDecode(input.value));
</script>

<style scoped></style>

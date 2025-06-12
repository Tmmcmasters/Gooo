<template>
  <div id="app">
    <form>
      <label for="input1">Input 1:</label>
      <input v-model="inputs.input1" id="input1" type="text" />
      <br />
      <label for="input2">Input 2:</label>
      <input v-model="inputs.input2" id="input2" type="text" />
      <br />
      <label for="input3">Input 3:</label>
      <input v-model="inputs.input3" id="input3" type="text" />
    </form>
    <p>Input 1: {{ inputs.input1 }}</p>
    <p>Input 2: {{ inputs.input2 }}</p>
    <p>Input 3: {{ inputs.input3 }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputs = ref({
  input1: '',
  input2: '',
  input3: '',
})
</script>

<style scoped>
label {
  margin-right: 10px;
}
input {
  margin-bottom: 10px;
}
</style>

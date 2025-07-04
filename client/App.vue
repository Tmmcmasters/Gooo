<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import TestComponent from './components/TestComponent.vue'

type Inputs = {
  input1: string
  input2: string
  input3: string
}
const inputs = ref<Inputs>({
  input1: '',
  input2: '',
  input3: '',
})

const stop = watch(
  inputs,
  () => {
    const initialData = document.getElementById('initial-data')
    if (initialData) {
      console.log(`Setting the initial data`)
      console.log(initialData)
      const data = JSON.parse(initialData.textContent || '{}')
      inputs.value = data.inputs || inputs.value // Update ref with server data
      initialData.remove()
    }
  },
  {
    immediate: true,
    once: true,
  },
)

onBeforeMount(() => {
  console.log('On before mount')
})
onMounted(() => {
  console.log('On mounted')
  stop()
})
</script>

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
    <p>Input 1: {{ inputs.input1 }} {{ inputs.input3 }} {{ inputs.input2 }}</p>
    <p>Input 2: {{ inputs.input2 }}</p>
    <p class="text-9xl">Input 3: {{ inputs.input3 }}</p>

    <TestComponent />
  </div>
</template>

<style scoped>
label {
  margin-right: 10px;
}
input {
  margin-bottom: 10px;
}
</style>

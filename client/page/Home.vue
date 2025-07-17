<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import Switch from '@/components/ui/switch/Switch.vue'
import Button from '@/components/ui/button/Button.vue'
import useThemeCookie from '@/composables/useThemeCookie'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

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
    const initialData = document.getElementById('home-initial-data')
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

const { isDark } = useThemeCookie()

const { count } = storeToRefs(useCounterStore())
const { increment } = useCounterStore()
</script>

<template>
  <div>
    <Switch v-model:model-value="isDark" />
    <p class="text-5xl">{{ count }}</p>
    <Button @click="increment">Increment</Button>
  </div>
</template>

<style scoped></style>

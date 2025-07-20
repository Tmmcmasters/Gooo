<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import useThemeCookie from '@/composables/useThemeCookie'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'
import GoooLink from '@/components/gooo/GoooLink.vue'

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

const { isDark, changeColor } = useThemeCookie()

const { count } = storeToRefs(useCounterStore())
const { increment } = useCounterStore()
</script>

<template>
  <div class="flex flex-col gap-5 h-full w-full">
    <Button @click="changeColor" variant="ghost" size="icon" class="absolute top-5 right-5"
      ><svg
        v-if="isDark"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-5 text-foreground"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
        <path
          d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-5 text-foreground"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
      </svg>
    </Button>
    <div class="flex items-center justify-between h-full gap-5 w-full">
      <Button
        variant="outline"
        class="max-w-80 w-full h-32 text-2xl flex relative flex-col justify-start items-start gap-y-1.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-8 p-0.5 text-foreground border border-border rounded-md"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M5 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />
          <path d="M9 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />
          <path d="M5 8h4" />
          <path d="M9 16h4" />
          <path
            d="M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041z"
          />
          <path d="M14 9l4 -1" />
          <path d="M16 16l3.923 -.98" />
        </svg>
        <span class="font-semibold text-lg leading-none">Documentation</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-5 absolute top-3 right-3"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M17 7l-10 10" />
          <path d="M8 7l9 0l0 9" />
        </svg>
        <span class="text-sm text-muted-foreground text-pretty text-left w-full"
          >It is recommended to read the documentation to get started.</span
        >
      </Button>
      <Button @click="increment" variant="outline" class="max-w-80 w-full h-28 text-2xl"
        >Counter: {{ count }}
      </Button>
    </div>
    <Button @click="increment">Increment</Button>
    <Button as-child variant="link"><GoooLink href="/todo" target="">To Do</GoooLink></Button>
  </div>
</template>

<style scoped></style>

<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'
import GoooLink from '@/components/gooo/GoooLink.vue'
import ArrowTRIcon from '@/components/icons/ArrowTRIcon.vue'
import DocIcon from '@/components/icons/DocIcon.vue'
import ArrowRIcon from '@/components/icons/ArrowRIcon.vue'
import TodoIcon from '@/components/icons/TodoIcon.vue'

const { count } = storeToRefs(useCounterStore())
const { increment } = useCounterStore()
</script>

<template>
  <div class="flex flex-col gap-5 h-full w-full">
    <div class="flex items-center justify-between h-full gap-5 w-full flex-wrap">
      <!-- Documentation Button Card -->
      <Button
        variant="outline"
        class="max-w-80 w-full h-32 text-2xl flex relative flex-col justify-start items-start gap-y-1.5"
      >
        <ArrowTRIcon class="size-5 absolute top-3 right-3 top-right-arrow" />
        <DocIcon class="size-8 p-0.5 text-foreground border border-border rounded-md" />
        <span class="font-semibold text-lg leading-none">Documentation</span>
        <span class="text-sm text-muted-foreground text-pretty text-left w-full"
          >It is recommended to read the documentation to get started.</span
        >
      </Button>

      <!-- Counter Button Card -->
      <Button @click="increment" variant="outline" class="max-w-80 w-full h-32 text-2xl"
        >Counter: {{ count }}
      </Button>

      <!-- To Do Link Button Card -->
      <Button
        as-child
        variant="outline"
        class="max-w-80 w-full h-32 text-2xl flex relative flex-col justify-start items-start gap-y-1.5"
        ><GoooLink href="/todo" target="">
          <ArrowRIcon class="size-5 absolute top-3 right-3 top-right-arrow" />
          <TodoIcon class="size-8 p-0.5 text-foreground border border-border rounded-md" />
          <span class="font-semibold text-lg leading-none"> To Do - <i>Example</i> </span>
          <span class="text-sm text-muted-foreground text-pretty text-left w-full">
            This is an example of a link to another page and to-do list.
          </span>
        </GoooLink></Button
      >
    </div>
  </div>
</template>

<style scoped></style>

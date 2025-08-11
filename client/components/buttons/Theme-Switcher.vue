<script setup lang="ts">
import useThemeCookie from '@/composables/useThemeCookie'
import Button from '../ui/button/Button.vue'
import SunIcon from '../icons/SunIcon.vue'
import MoonIcon from '../icons/MoonIcon.vue'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const { isDark, changeColor } = useThemeCookie()

const { count } = storeToRefs(useCounterStore())
</script>

<template>
  <div class="absolute top-5 right-5 flex justify-center items-center gap-x-5">
    <p>Count: {{ count }}</p>
    <Button @click="changeColor" variant="ghost" size="icon">
      <SunIcon v-if="isDark" class="size-5 text-foreground" />
      <MoonIcon v-else class="size-5 text-foreground" />
    </Button>
  </div>
</template>

<style scoped></style>

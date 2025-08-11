<script setup lang="ts">
import GoooLink from '@/components/gooo/GoooLink.vue'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const { count } = storeToRefs(useCounterStore())
</script>

<template>
  <div class="h-full w-full">
    <GoooLink href="/">Home</GoooLink>
  </div>
</template>

<style scoped></style>

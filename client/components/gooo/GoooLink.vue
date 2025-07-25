<script setup lang="ts">
import type { GoooLinkProps } from '@/components/gooo/index'
import { navigate } from '@/utils/goooNavigation'

defineOptions({
  inheritAttrs: true,
})

const props = withDefaults(defineProps<GoooLinkProps>(), {
  href: '#',
  prefetch: true,
  noPrefetch: false,
  prefetchOn: 'interaction',
})
</script>

<template>
  <a v-bind="props" @click.prevent.stop="navigate(props.href)" :target="target?.toString()">
    <slot />
  </a>
</template>

<style scoped></style>

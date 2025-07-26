<script setup lang="ts">
import type { GoooLinkProps } from '@/components/gooo/index'
import { navigate, prefetch as prefetchGooo } from '@/utils/goooNavigation'
import { useElementVisibility } from '@vueuse/core'
import { computed, reactive, toRefs, useTemplateRef, watch } from 'vue'

defineOptions({
  inheritAttrs: true,
})

const props = withDefaults(defineProps<GoooLinkProps>(), {
  href: '#',
  prefetch: true,
  noPrefetch: false,
  prefetchOn: 'interaction',
})

const reactiveProps = reactive({
  href: props.href,
  target: props.target,
  prefetch: props.prefetch,
  prefetchOn: props.prefetchOn,
  noPrefetch: props.noPrefetch,
})

const { href, target, prefetch, prefetchOn, noPrefetch } = toRefs(reactiveProps)

const prefetchEnabled = computed(() => {
  return prefetch.value && !noPrefetch.value
})

const link = useTemplateRef<HTMLAnchorElement>('link')
const isVisible = useElementVisibility(link)

function handlePrefetchInteraction() {
  if (!prefetchEnabled.value || prefetchOn.value !== 'interaction') return

  prefetchGooo(href.value)
}

function handlePrefetchVisibility() {
  if (!prefetchEnabled.value || prefetchOn.value !== 'visibility') return

  prefetchGooo(href.value)
}

watch(
  isVisible,
  (newValue) => {
    if (newValue === true) handlePrefetchVisibility()
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <a
    ref="link"
    v-bind="props"
    @mouseover="handlePrefetchInteraction"
    @touchstart="handlePrefetchInteraction"
    @focusin="handlePrefetchInteraction"
    @click.prevent.stop="navigate(href)"
    :target="target?.toString()"
  >
    <slot />
  </a>
</template>

<style scoped></style>

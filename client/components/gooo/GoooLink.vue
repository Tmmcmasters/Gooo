<script setup lang="ts">
import { $fetch } from 'ofetch'
import type { GoooLinkProps } from '@/components/gooo/index'

defineOptions({
  inheritAttrs: true,
})

const props = withDefaults(defineProps<GoooLinkProps>(), {
  href: '#',
  prefetch: true,
  noPrefetch: false,
  prefetchOn: 'interaction',
})

const getDocument = () =>
  $fetch<Document>(props.href, {
    method: 'GET',
    headers: {
      Accept: 'text/html',
    },
    onResponse: ({}) => {},
  })
const fetch = async () => {
  const response = await getDocument()
  const responseLayout = response.querySelector('goo-layout')
  if (!responseLayout) {
    console.error('No gooo-layout attribute found in response')
    return
  }
  document.querySelector('goo-layout')?.replaceWith(responseLayout)
  console.log('Here is the response from the page')
  console.log(response)
}
</script>

<template>
  <a v-bind="props" @click.prevent.stop="fetch" :target="props.target as string" />
</template>

<style scoped></style>

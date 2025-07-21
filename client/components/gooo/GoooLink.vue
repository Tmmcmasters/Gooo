<script setup lang="ts">
import type { GoooLinkProps } from '@/components/gooo/index'
import { $fetch } from 'ofetch'
import { shallowRef } from 'vue'

defineOptions({
  inheritAttrs: true,
})

const props = withDefaults(defineProps<GoooLinkProps>(), {
  href: '#',
  prefetch: true,
  noPrefetch: false,
  prefetchOn: 'interaction',
})

const fetchStatus = shallowRef<'pending' | 'success' | 'error' | 'idle'>('idle')

const getDocument = () => {
  return $fetch<string>(props.href, {
    method: 'GET',
    headers: {
      Accept: 'text/html',
    },

    onRequest: ({}) => {
      fetchStatus.value = 'pending'
    },
    onResponse: ({ response }) => {
      if (response.ok) {
        fetchStatus.value = 'success'
      } else {
        fetchStatus.value = 'error'
      }
    },
    onResponseError: () => {
      fetchStatus.value = 'error'
    },
  })
}

const fetch = async () => {
  const response = await getDocument()
  // Parse the HTML string into a Document object
  const parser = new DOMParser()

  const doc = parser.parseFromString(response, 'text/html')

  console.log('Here is the doc')
  console.log(doc)

  const responseLayout = doc.querySelector('[gooo-layout]')
  console.log('Here is the response Layout')
  console.log(responseLayout)
  if (!responseLayout) {
    console.error(`No gooo-layout attribute found in response, aborting route.  Document: ${doc}`)
    return
  }
  // document.querySelector('goo-layout')?.replaceWith(responseLayout);
  console.log('Here is the response from the page')
  console.log(response)
}
</script>

<template>
  <a v-bind="props" @click.prevent.stop="fetch" :target="target?.toString()">
    <slot />
  </a>
</template>

<style scoped></style>

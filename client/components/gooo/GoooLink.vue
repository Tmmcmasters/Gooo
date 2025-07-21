<script setup lang="ts">
import type { GoooLinkProps } from '@/components/gooo/index'
import { $fetch } from 'ofetch'
import { shallowRef, onMounted, onUnmounted } from 'vue'

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

// Store the current URL to track navigation
const currentUrl = shallowRef(window.location.pathname)

const getDocument = (url: string) => {
  return $fetch<string>(url, {
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
  try {
    const htmlResponse = await getDocument(props.href)
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlResponse, 'text/html')
    console.log('Here is the doc')
    console.log(doc)

    const responseLayout = doc.querySelector('[gooo-layout]')
    console.log('Here is the response Layout')
    console.log(responseLayout)
    if (!responseLayout) {
      console.error(`No gooo-layout attribute found in response, aborting route. Document: ${doc}`)
      fetchStatus.value = 'error'
      return
    }

    const existingPage = document.querySelector('[gooo-layout]')
    if (existingPage) {
      existingPage.replaceWith(responseLayout!)
    }

    // Update the URL and history with the new title
    const newTitle = doc.querySelector('title')?.textContent || document.title
    window.history.pushState({ url: props.href }, newTitle, props.href)
    currentUrl.value = props.href
    console.log('Here is the response from the page')
    console.log(htmlResponse)
  } catch (error) {
    console.error('Fetch or parsing error:', error)
    fetchStatus.value = 'error'
  }
}

// Handle back/forward navigation
const handlePopState = async () => {
  const newUrl = window.location.pathname
  console.log('Popstate event triggered, new URL:', newUrl)
  if (newUrl !== currentUrl.value) {
    fetchStatus.value = 'pending'
    try {
      const htmlResponse = await getDocument(newUrl)
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlResponse, 'text/html')
      const responseLayout = doc.querySelector('[gooo-layout]')
      if (!responseLayout) {
        console.error(`No gooo-layout attribute found for ${newUrl}`)
        fetchStatus.value = 'error'
        return
      }
      const existingPage = document.querySelector('[gooo-layout]')
      if (existingPage) {
        existingPage.replaceWith(responseLayout)
      }
      const newTitle = doc.querySelector('title')?.textContent || document.title
      window.history.replaceState({ url: newUrl }, newTitle, newUrl)
      currentUrl.value = newUrl
      fetchStatus.value = 'success'
    } catch (error) {
      console.error('Error handling popstate:', error)
      fetchStatus.value = 'error'
    }
  }
}

onMounted(() => {
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})
</script>

<template>
  <a v-bind="props" @click.prevent.stop="fetch" :target="target?.toString()">
    <slot />
  </a>
</template>

<style scoped></style>

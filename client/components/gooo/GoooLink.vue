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
const currentUrl = shallowRef(window.location.pathname)

// Function to reload scripts dynamically
const reloadScripts = (doc: Document) => {
  // Remove existing page-specific scripts
  document.querySelectorAll('script[data-page-script]').forEach((script) => {
    script.remove()
  })

  const scripts = doc.querySelectorAll('script')
  scripts.forEach((oldScript) => {
    const newScript = document.createElement('script')
    newScript.setAttribute('data-page-script', 'true') // Mark as page-specific
    if (oldScript.src) {
      newScript.type = oldScript.type || 'text/javascript'
      newScript.src = oldScript.src
      newScript.async = false
    } else {
      newScript.type = oldScript.type || 'text/javascript'
      newScript.textContent = oldScript.textContent
    }
    document.body.appendChild(newScript)
  })
}

const getDocument = (url: string) => {
  return $fetch<string>(url, {
    method: 'GET',
    headers: {
      Accept: 'text/html',
    },
    onRequest: () => {
      fetchStatus.value = 'pending'
    },
    onResponse: ({ response }) => {
      fetchStatus.value = response.ok ? 'success' : 'error'
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

    const responseLayout = doc.querySelector('[gooo-layout]')
    if (!responseLayout) {
      console.error(`No gooo-layout attribute found in response, aborting route. Document: ${doc}`)
      fetchStatus.value = 'error'
      return
    }

    const existingPage = document.querySelector('[gooo-layout]')
    if (existingPage) {
      existingPage.replaceWith(responseLayout)
    }

    // Reload scripts after replacing content
    reloadScripts(doc)

    // Update the URL and history with the new title
    const newTitle = doc.querySelector('title')?.textContent || document.title
    window.history.pushState({ url: props.href }, newTitle, props.href)
    currentUrl.value = props.href
  } catch (error) {
    console.error('Fetch or parsing error:', error)
    fetchStatus.value = 'error'
  }
}

function executeScripts(container: Element) {
  const scripts = container.querySelectorAll('script[data-page-script]')
  scripts.forEach((currentScript) => {
    const oldScript = currentScript as HTMLScriptElement
    const newScript = document.createElement('script')
    newScript.setAttribute('data-page-script', 'true')
    if (oldScript.src) {
      newScript.type = oldScript.type || 'text/javascript'
      newScript.src = `${oldScript.src}?v=${Date.now()}`
      newScript.async = false
    } else {
      newScript.type = oldScript.type || 'text/javascript'
      newScript.textContent = oldScript.textContent
    }
    // Replace the old script with the new one to trigger execution
    oldScript.parentNode?.replaceChild(newScript, oldScript)
  })
}

const handlePopState = async () => {
  const newUrl = window.location.pathname
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

        // Execute scripts
        executeScripts(responseLayout)
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

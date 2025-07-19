<script lang="ts">
import type { AnchorHTMLAttributes } from 'vue'
import { $fetch } from 'ofetch'

export interface GoooLinkProps extends Omit<AnchorHTMLAttributes, 'href' | 'target'> {
  href: string
  /**
   * Forces the link to be considered as external (true) or internal (false). This is helpful to handle edge-cases
   */
  external?: boolean

  /**
   * Where to display the linked URL, as the name for a browsing context.
   */
  target?: '_blank' | '_parent' | '_self' | '_top' | (string & {}) | null
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<GoooLinkProps>(), {
  href: '',
})

const getDocument = () =>
  $fetch<Document>(props.href, {
    method: 'get',
    headers: {
      Accept: 'text/html',
    },
  })

const fetch = async () => {
  const response = await getDocument()
  console.log('Here is the response from the page')
  console.log(response)
}
</script>

<template>
  <a v-bind="props" @click.prevent.stop="fetch" />
</template>

<style scoped></style>

<script setup lang="ts">
import { $fetch } from 'ofetch'
import type { GoooLinkProps } from '@/components/gooo/index'

defineOptions({
  inheritAttrs: true,
})

const props = withDefaults(defineProps<GoooLinkProps>(), {
  href: '#',
})

// const props = defineProps<GoooLinkProps>();

const getDocument = () =>
  $fetch<Document>(props.href, {
    method: 'GET',
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
  <a v-bind="props" @click.prevent.stop="fetch" :target="props.target as string" />
</template>

<style scoped></style>

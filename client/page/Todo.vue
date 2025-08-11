<script setup lang="ts">
import GoooLink from '@/components/gooo/GoooLink.vue'
import AddIcon from '@/components/icons/AddIcon.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
</script>

<template>
  <Button as-child variant="outline" class="absolute top-5 left-5">
    <!-- eslint-disable-next-line vue/no-parsing-error -->
    <GoooLink href="/"><-- Go Home</GoooLink>
  </Button>
  <div class="flex items-center justify-center gap-x-2">
    <div class="relative w-full max-w-xs items-center">
      <Input placeholder="Enter your task" class="pl-9" />
      <!-- Here is the icon -->
      <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
        <AddIcon />
      </span>
    </div>
    <Button> Add Task </Button>
  </div>
</template>

<style scoped></style>

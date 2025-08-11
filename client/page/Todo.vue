<script setup lang="ts">
import GoooLink from '@/components/gooo/GoooLink.vue'
import AddIcon from '@/components/icons/AddIcon.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import { useTodoStore } from '@/stores/todo'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const { todos } = storeToRefs(useTodoStore())

const inputModel = ref<string>('')

function addTodo(text: string) {
  todos.value.push(text)
}

function removeTodo(index: number) {
  todos.value.splice(index, 1)
}
</script>

<template>
  <div class="flex flex-col justify-center items-center">
    <Button as-child variant="outline" class="absolute top-5 left-5">
      <!-- eslint-disable-next-line vue/no-parsing-error -->
      <GoooLink href="/"><-- Go Home</GoooLink>
    </Button>
    <div class="flex items-center justify-center gap-x-2 max-w-md w-full">
      <div class="relative w-full flex items-center">
        <Input v-model="inputModel" placeholder="Enter your task" class="pl-9" />
        <!-- Here is the icon -->
        <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
          <AddIcon />
        </span>
      </div>
      <Button @click="addTodo(inputModel)"> Add Task </Button>
    </div>

    <div class="flex flex-col justify-start items-center gap-y-2 my-2 w-full">
      <div
        v-for="(todo, index) in todos"
        :key="index"
        class="flex items-center justify-between w-full max-w-md gap-x-3"
      >
        <p
          class="py-2 px-2 rounded-lg text-sm font-medium border border-solid border-border flex-grow text-pretty bg-secondary"
        >
          {{ todo }}
        </p>
        <Button @click="removeTodo(index)" variant="outline"> Remove </Button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

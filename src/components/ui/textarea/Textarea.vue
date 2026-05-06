<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: any
  defaultValue?: string | number
  modelValue?: string | number
  id?: string
  name?: string
  placeholder?: string
  required?: boolean
  rows?: number | string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <textarea
    v-model="modelValue"
    :id="id"
    :name="name"
    :placeholder="placeholder"
    :required="required"
    :rows="rows"
    v-bind="$attrs"
    :class="
      cn(
        'flex min-h-[80px] w-full rounded-l border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>

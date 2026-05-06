<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: any
  id?: string
  name?: string
  type?: string
  placeholder?: string
  required?: boolean
  value?: string | number
  min?: string | number
  max?: string | number
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
  <input
    v-model="modelValue"
    :id="id"
    :name="name"
    :type="type || 'text'"
    :placeholder="placeholder"
    :required="required"
    :value="value"
    v-bind="$attrs"
    :class="
      cn(
        'flex h-10 w-full rounded-l border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>

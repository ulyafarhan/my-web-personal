<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  id?: string
}>()
</script>

<template>
  <div :id="id" :class="cn('p-6 pt-0', props.class)">
    <slot />
  </div>
</template>

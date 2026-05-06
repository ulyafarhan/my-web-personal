<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  id?: string
}>()
</script>

<template>
  <div
    :id="id"
    :class="
      cn(
        'rounded-xl border border-white/10 bg-white/[0.02] text-card-foreground shadow-sm backdrop-blur-sm',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>

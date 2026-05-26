<template>
  <div
    :class="[
      'bg-white dark:bg-slate-900 rounded-xl shadow-sm border-l-4 p-6 transition-all hover:shadow-md border-r border-t border-b border-slate-200 dark:border-slate-800',
      borderColorClass,
    ]"
  >
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{{ label }}</p>
        <p class="text-3xl font-bold text-slate-900 dark:text-white">{{ value }}</p>
        <p v-if="trend" :class="['text-sm mt-2 font-medium flex items-center gap-1', trendColorClass]">
          <span>{{ trendIcon }}</span> <span>{{ trend }}</span>
        </p>
      </div>
      <div :class="['p-3 rounded-lg', iconBgClass]">
        <component :is="icon" :class="['w-6 h-6', iconColorClass]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: [String, Number],
  trend: String,
  type: {
    type: String,
    default: 'primary', // primary, success, warning, danger
  },
  icon: Object,
})

const borderColorClass = computed(() => {
  const colors = {
    primary: 'border-l-blue-500',
    success: 'border-l-green-500',
    warning: 'border-l-orange-500',
    danger: 'border-l-red-500',
  }
  return colors[props.type] || colors.primary
})

const iconBgClass = computed(() => {
  const colors = {
    primary: 'bg-blue-50 dark:bg-blue-900/30',
    success: 'bg-green-50 dark:bg-green-900/30',
    warning: 'bg-orange-50 dark:bg-orange-900/30',
    danger: 'bg-red-50 dark:bg-red-900/30',
  }
  return colors[props.type] || colors.primary
})

const iconColorClass = computed(() => {
  const colors = {
    primary: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-orange-600 dark:text-orange-400',
    danger: 'text-red-600 dark:text-red-400',
  }
  return colors[props.type] || colors.primary
})

const trendColorClass = computed(() => {
  if (!props.trend) return ''
  if (props.trend.startsWith('+')) return 'text-green-600 dark:text-green-400'
  if (props.trend.startsWith('-')) return 'text-red-600 dark:text-red-400'
  return 'text-slate-600 dark:text-slate-400'
})

const trendIcon = computed(() => {
  if (!props.trend) return ''
  if (props.trend.startsWith('+')) return '↑'
  if (props.trend.startsWith('-')) return '↓'
  return ''
})
</script>

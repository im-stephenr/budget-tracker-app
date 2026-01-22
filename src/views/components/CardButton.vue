<script setup>
const props = defineProps({
  path: String,
  title: String,
});
</script>
<template>
  <router-link
    :to="props.path"
    class="border border-gray-300 rounded-lg p-2 shadow-sm text-center place-items-center active:bg-gray-200"
  >
    <slot name="icon"></slot>
    <span class="text-xs text-gray-600">{{ props.title }}</span>
  </router-link>
</template>

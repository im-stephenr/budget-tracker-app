<script setup>
const props = defineProps({
  pageName: String,
  currentPage: Function,
});
</script>
<template>
  <header class="w-full text-red-500 flex align-center" id="app_header">
    <div v-if="pageName === 'Edit Transaction'" class="h-20 ml-2 flex">
      <router-link
        class="h-full w-full pt-7"
        @click="currentPage('Transaction History')"
        to="/transaction-history"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 text-white"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
      </router-link>
    </div>
    <div class="h-20 ml-10 flex">
      <span class="text-2xl mt-10 text-white text-shadow-lg">
        {{ props.pageName }}
      </span>
    </div>
  </header>
</template>

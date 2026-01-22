<script setup>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import { ref } from "vue";

const pageName = ref("Dashboard");

const currentPage = (page) => {
  pageName.value = page;
};
</script>
<template>
  <div class="flex h-screen justify-between flex-col">
    <Header :pageName="pageName" :currentPage="currentPage" />
    <main class="mb-auto h-screen overflow-y-scroll" id="main_content">
      <!-- define emit change-title, calls currentPage function when change-title is emitted to child components inside router-view -->
      <router-view @change-title="currentPage" />
    </main>
    <Footer :currentPage="currentPage" />
  </div>
</template>

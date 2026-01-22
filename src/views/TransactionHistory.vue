<script setup>
import { computed, onMounted, ref } from "vue";
import { getDB } from "/src/services/database";
import { useToast } from "vue-toast-notification";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { formatDate } from "../utils/format_date";

const transaction_list = ref([]);
const toast = useToast();
const image_previews = ref({}); // map of fileName → image src
const receipt_image_modal = ref("");
const isLoading = ref(false);
const months = ref([
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]);
const d = new Date();
const current_month_name = ref(months.value[d.getMonth()]);
const current_month = ref(d.getMonth() + 1);
const current_year = ref(d.getFullYear());
const year_options = ref([]);
const form_filter = ref({
  month: current_month.value,
  year: current_year.value,
});

// Load Year
const loadYear = async () => {
  const db = getDB();

  try {
    const result = await db.query(
      "SELECT DISTINCT(strftime('%Y', date)) as year FROM transactions"
    );
    if (result.values.length > 0) {
      year_options.value = result.values;
    }
  } catch (err) {
    console.log("Error", err);
  }
};

// Load Transactions
const loadTransactions = async (month, year) => {
  isLoading.value = true;
  // Load transactions from the database based on the selected month and year
  const db = getDB();
  let month_q = "";
  let year_q = "";
  if (month != "All") {
    month_q = `AND strftime('%m', date) = '${month
      .toString()
      .padStart(2, "0")}'`;
  }
  if (year != "All") {
    year_q = ` AND strftime('%Y', date) = '${year}'`;
  }
  const result = await db.query(
    `SELECT transactions.*, categories.name as category, payment_methods.name as payment_method, purposes.name as purpose, strftime('%Y', date) AS year, strftime('%m', date) AS month, strftime('%Y-%m', date) AS year_month FROM transactions LEFT JOIN categories ON transactions.category_id=categories.id LEFT JOIN payment_methods ON transactions.payment_method_id=payment_methods.id LEFT JOIN purposes ON purposes.id=transactions.purpose_id WHERE 1 ${month_q} ${year_q} ORDER BY datetime(date) DESC`
  );
  for (const p of result.values) {
    image_previews.value[p.image_path] = await getPhotoUrl(p.image_path);
  }
  const groups = {};
  // transaction_list.value = result.values; // returns array of rows
  result.values.forEach((tx) => {
    if (!groups[tx.year_month]) {
      groups[tx.year_month] = [];
    }
    groups[tx.year_month].push(tx);
  });

  transaction_list.value = groups;
  isLoading.value = false;
};
// Define emit to change page title
const emit = defineEmits(["change-title"]);

// Emit the change-title to Default Layout
const updatePage = () => {
  emit("change-title", "Edit Transaction");
};

// Delete Transaction
const handleDelete = async (transaction_id, image_path) => {
  if (!confirm("Are you sure you want to delete this transaction?")) {
    return false;
  }
  const db = getDB();
  const result = await db.query("DELETE FROM transactions WHERE id=?", [
    transaction_id,
  ]);

  // Delete the image safely
  try {
    if (image_path) {
      await Filesystem.deleteFile({
        path: image_path,
        directory: Directory.Data,
      });
    }
  } catch (err) {
    console.warn("Image not found or already deleted:", err);
    // do NOT stop the app — image missing is not fatal
  }

  toast.success("Transaction Deleted Successfully!", {
    position: "top",
  });
  loadTransactions();
};

// Helper: Convert stored file path back into usable <img> src
const getPhotoUrl = async (filePath) => {
  // No file → use placeholder
  if (!filePath) {
    return "/images/shop-placeholder.png";
  }

  // Invalid directory path
  if (filePath.endsWith("/")) {
    console.warn("Invalid file path (directory):", filePath);
    return "/images/shop-placeholder.png";
  }

  try {
    const result = await Filesystem.readFile({
      path: filePath,
      directory: Directory.Data,
    });

    return `data:image/jpeg;base64,${result.data}`;
  } catch (err) {
    console.error("Failed to read file:", err);
    return "/images/shop-placeholder.png";
  }
};

// Month - Year format
const formatMonthYear = (dateString) => {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const handleFilter = async () => {
  await loadTransactions(form_filter.value.month, form_filter.value.year);
};

// Display clicked image to modal
const displayReceiptModal = (src) => {
  console.log("OPENING", src);

  receipt_image_modal.value = src;
};

onMounted(async () => {
  await loadTransactions(current_month.value, current_year.value);
  await loadYear();
});
</script>
<template>
  <!-- IMAGE MODAL -->
  <el-dialog>
    <dialog
      id="dialog"
      aria-labelledby="dialog-title"
      class="fixed inset-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent"
    >
      <el-dialog-backdrop
        class="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      ></el-dialog-backdrop>

      <!-- Removed min-h-full  -->
      <div
        tabindex="0"
        class="flex items-end justify-center p-4 text-center focus:outline-none sm:items-center sm:p-0"
      >
        <el-dialog-panel
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <div class="mt-2">
                  <img
                    :src="receipt_image_modal != '' ? receipt_image_modal : ''"
                    alt="Receipt Image"
                    class="h-full border-1 border-gray-100 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              command="close"
              commandfor="dialog"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Close
            </button>
          </div>
        </el-dialog-panel>
      </div>
    </dialog>
  </el-dialog>
  <!-- END OF IMAGE MODAL -->
  <div class="overflow-x-auto p-2">
    <div class="overflow-hidden">
      <!-- Select options -->
      <form @submit.prevent="handleFilter" method="POST">
        <div class="w-full flex flex-row gap-2 justify-center mb-5">
          <div class="">
            <select
              v-model="form_filter.month"
              class="block py-2.5 ps-0 w-full text-sm text-body bg-transparent border-0 border-b-2 border-gray-400 appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            >
              <option value="All">All</option>
              <option
                v-for="(month, index) in months"
                :key="index"
                :value="index + 1"
              >
                {{ month }}
              </option>
            </select>
          </div>
          <div class="">
            <select
              v-model="form_filter.year"
              class="block py-2.5 ps-0 w-full text-sm text-body bg-transparent border-0 border-b-2 border-gray-400 appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            >
              <option value="All">All</option>
              <option
                v-for="(year, index) in year_options"
                :key="index"
                :selected="year.year == current_year"
              >
                {{ year.year }}
              </option>
            </select>
            <!-- <select
              v-model="form_filter.year"
              class="block py-2.5 ps-0 w-full text-sm text-body bg-transparent border-0 border-b-2 border-gray-400 appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            >
              <option value="All">All</option>
              <option value="2025">2025</option>
            </select> -->
          </div>
          <div class="">
            <button
              type="submit"
              class="text-white shadow-sm rounded-sm mt-2 bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 box-border border border-transparent font-medium leading-5 rounded-base text-sm px-2 py-1 text-center inline-flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                />
              </svg>
            </button>
          </div>
        </div>
      </form>
      <!-- LOADING ICON -->
      <!-- <div
        v-if="isLoading"
        class="grid min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible"
      >
        <svg
          class="text-gray-300 animate-spin"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
        >
          <path
            d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
            stroke="currentColor"
            stroke-width="5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
          <path
            d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
            stroke="currentColor"
            stroke-width="5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-gray-900"
          ></path>
        </svg>
      </div> -->

      <!-- Card -->
      <div v-for="i in 5" :key="i">
        <p class="text-sm font-bold text-gray-400 italic text-center">
          <!-- // adding 01 (Day number) so the Y-m-d format will be complete as it is needed when reformatting the date to Month name and Year -->
          {{ formatMonthYear(month_year + "-01") }}
        </p>
        <div
          v-for="i in 5"
          :key="i"
          class="border rounded-sm border-gray-200 m-auto p-2 shadow-sm bg-gray-50 mb-4"
        >
          <h1 class="font-bold inline-block text-lg">TEST</h1>
          <div class="inline">
            <!-- BUTTONS -->
            <router-link
              @click="updatePage"
              class="inline-flex ml-1 font-semibold rounded-lg border border-transparent text-green-600 hover:text-green-800 focus:outline-hidden focus:text-green-800 disabled:opacity-50 disabled:pointer-events-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </router-link>
            <!-- DELETE -->
            <button
              type="button"
              class="inline-flex float-right items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div>

          <div class="w-full flex">
            <!-- IMAGE -->
            <div class="w-30">
              <button command="show-modal" commandfor="dialog" class="w-32">
                <img
                  class="border border-gray-100 p-1"
                  :src="`/images/shop-placeholder.png`"
                  alt=""
                />
              </button>

              <!-- DATE -->
              <div class="w-full text-center relative text-gray-500 mt-1">
                <p style="font-size: 0.6rem" class="italic font-bold">
                  2025-01-01
                </p>
              </div>
            </div>
            <!-- Content -->
            <div class="w-70 flex ml-2">
              <div class="w-60">
                <!-- PURCHASE SOURCE -->
                <h1 class="font-medium text-sm">TEST</h1>
                <!-- PURPOSE -->
                <p style="font-size: 10px" class="text-gray-400 relative -mt-1">
                  PURPOSE
                </p>
                <!-- Note -->
                <div class="w-full mt-1 relative text-gray-500">
                  <p class="text-xs italic">NOTE TEST</p>
                </div>
              </div>
              <div class="w-40 relative">
                <!-- PRICE -->
                <p
                  style="font-family: Arial, Helvetica, sans-serif !important"
                  class="text-sm absolute bottom-1 text-right mt-6 font-bold"
                >
                  100
                </p>

                <!-- PAYMENT METHOD -->
                <p class="text-xs absolute bottom-8 text-red-300">Cash</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- <div
        class="w-full text-center"
        v-if="Object.keys(transaction_list).length === 0"
      >
        <h1 class="text-lg text-gray-400 italic">
          You don't have transaction for this month.
        </h1>
      </div> -->
    </div>
  </div>
</template>

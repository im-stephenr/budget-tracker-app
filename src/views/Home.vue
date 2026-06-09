<script setup>
import { computed, onMounted, ref } from "vue";
import { getDB } from "/src/services/database";
import ProgressBarTransactions from "./components/ProgressBarTransactions.vue";
import ProgressBarPurposes from "./components/ProgressBarPurposes.vue";

const activeKey = ref(0);

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
let current_month = ref(months.value[d.getMonth()]);
const selected_month = ref(months.value[d.getMonth()]);
const current_year = ref(d.getFullYear());
const budget_data = ref({
  amount: 0,
  month: d.getMonth(),
  year: current_year.value,
});
const transaction_data_purchase_source = ref({});
const transaction_data_purpose = ref({});
const total_expense = ref(0);
const todays_total_expense = ref(0);
const current_balance = ref(0);
const pb_total_expense = ref(0);
const pb_todays_total_expense = ref(0);
const form_filter = ref({
  year: current_year.value,
});
const year_options = ref([]);
const total_transaction_count = ref(0);
const piggy_balance = ref("/images/pighappy.png");

const todaysTotalExpenseVisibility = computed(() => {
  // always converts to number to avoid string/number mismatches
  return (
    selected_month.value === current_month.value &&
    Number(form_filter.value.year) === Number(current_year.value)
  );
});

// Load Year
const loadYear = async () => {
  const db = getDB();

  try {
    const result = await db.query(
      "SELECT DISTINCT(strftime('%Y', date)) as year FROM transactions",
    );
    if (result.values.length > 0) {
      year_options.value = result.values;
    }
  } catch (err) {
    console.log("Error", err);
  }
};

// Handle Changing Month
const changeMonth = async (type) => {
  // Get Current index of selected month
  let current_month_index = months.value.indexOf(selected_month.value);

  if (type == "next" && current_month_index !== -1) {
    current_month_index++;
    selected_month.value = months.value[current_month_index]; // add index
    await loadBudget(current_month_index, form_filter.value.year);
    await loadTransactions(current_month_index, form_filter.value.year);
  } else if (type == "prev" && current_month_index !== -1) {
    current_month_index--;
    selected_month.value = months.value[current_month_index]; // subtract index
    await loadBudget(current_month_index, form_filter.value.year);
    await loadTransactions(current_month_index, form_filter.value.year);
  }

  console.log(current_month_index);
  activeKey.value++;
};

// Loading Budget Data
const loadBudget = async (month, year) => {
  const db = getDB();
  month++;
  try {
    const result = await db.query(
      "SELECT * FROM budget WHERE month=? AND year=?",
      [month, year], // adding 1 since months index is always -1 as it is array and starts at zero (Ex. Dec = 11)
    );
    if (result.values.length > 0) {
      budget_data.value = result.values[0];
    } else {
      budget_data.value.amount = 0;
      budget_data.value.month = d.getMonth();
      budget_data.value.year = form_filter.value.year;
    }
  } catch (err) {
    console.log("Error", err);
  }
};

// Loading Transactions
const loadTransactions = async (month, year) => {
  const db = getDB();
  month++; // increment the selected month from argument since the month array starts at 0 and query needs exact number of month
  try {
    const monthStr = month.toString().padStart(2, "0");
    const yearStr = year.toString();
    console.log("monthStr", monthStr);
    // fetch list
    const result_purchase_source = await db.query(
      "SELECT categories.id, categories.name, categories.color, SUM(transactions.amount) as total_expense FROM categories LEFT JOIN transactions ON transactions.category_id=categories.id WHERE strftime('%m', transactions.date) = ? AND strftime('%Y', transactions.date)=? GROUP BY categories.id, categories.name ORDER BY SUM(transactions.amount) DESC",
      [monthStr, yearStr],
    );
    if (result_purchase_source.values.length > 0) {
      transaction_data_purchase_source.value = result_purchase_source.values;
    } else {
      transaction_data_purchase_source.value = [];
    }

    const result_purpose = await db.query(
      "SELECT purposes.id, purposes.name, SUM(transactions.amount) as total_expense FROM purposes LEFT JOIN transactions ON transactions.purpose_Id=purposes.id WHERE strftime('%m', transactions.date) = ? AND strftime('%Y', transactions.date)=? GROUP BY purposes.id, purposes.name ORDER BY SUM(transactions.amount) DESC",
      [monthStr, yearStr],
    );
    if (result_purpose.values.length > 0) {
      transaction_data_purpose.value = result_purpose.values;
    } else {
      transaction_data_purpose.value = [];
    }

    // Fetch total (separated as it causes issue if combined above returning 1 row only)
    const total = await db.query(
      "SELECT SUM(amount) AS total_expense FROM transactions WHERE strftime('%m', date)=? AND strftime('%Y', date)=?",
      [monthStr, yearStr],
    );

    // Fetch today's total (separated as it causes issue if combined above returning 1 row only)
    const todays_total = await db.query(
      "SELECT SUM(amount) AS total_expense FROM transactions WHERE date = date('now')",
    );

    // Fetch total transactions
    const total_transactions = await db.query(
      "SELECT COUNT(*) AS total_transaction_count FROM transactions WHERE strftime('%m', date)=? AND strftime('%Y', date)=?",
      [monthStr, yearStr],
    );
    // Total expense
    total_expense.value = total.values[0].total_expense || 0;
    // Current balance
    current_balance.value = budget_data?.value.amount - total_expense.value;
    
    
    // Progress bar for total expense
    pb_total_expense.value =
      (total_expense?.value / budget_data?.value.amount) * 100 || 0;

      // Dynamic Piggy Image under  Balance card
    if(parseFloat(pb_total_expense.value) >= 100 ){
      piggy_balance.value="/images/pigsad.png";
    }else if(parseFloat(pb_total_expense.value) >= 80 ){
      piggy_balance.value="/images/pigangry.png";
    }else{
      piggy_balance.value="/images/pighappy.png";
    }


    // Today's total expense
    todays_total_expense.value = todays_total.values[0].total_expense || 0;
    // Progress bar for today's total expense
    pb_todays_total_expense.value =
      (todays_total_expense?.value / budget_data?.value.amount) * 100 || 0;
    total_expense.value = total.values[0].total_expense || 0;
    // Total Transactions count
    total_transaction_count.value =
      total_transactions.values[0].total_transaction_count || 0;
  } catch (err) {
    console.log("Error", err);
  }
};

// SWIPE FUNCTION
const startX = ref(0);
const endX = ref(0);
const swipeThreshold = 50; // minimum px to count as swipe

const onTouchStart = (e) => {
  startX.value = e.changedTouches[0].clientX;
};

const onTouchEnd = (e) => {
  endX.value = e.changedTouches[0].clientX;
  handleSwipe();
};

const handleSwipe = () => {
  const diff = endX.value - startX.value;

  if (Math.abs(diff) < swipeThreshold) return;

  if (diff > 0) {
    if (selected_month.value !== "January") changeMonth("prev"); // swipe right
  } else {
    if (selected_month.value !== "December") changeMonth("next"); // swipe left
  }
};

const handleChangeYear = async (new_year) => {
  form_filter.value.year = Number(new_year);
  await loadBudget(
    months.value.indexOf(selected_month.value),
    form_filter.value.year,
  );
  await loadTransactions(
    months.value.indexOf(selected_month.value),
    form_filter.value.year,
  );
};

onMounted(async () => {
  await loadBudget(
    months.value.indexOf(selected_month.value),
    form_filter.value.year,
  );
  await loadTransactions(
    months.value.indexOf(selected_month.value),
    form_filter.value.year,
  );
  await loadYear();
});
</script>
<template>
  <div @touchstart="onTouchStart" @touchend="onTouchEnd">
    <div class="flex justify-center mt-5">
      <!-- Right Arrow -->
      <button
        type="button"
        v-if="selected_month !== 'January'"
        @click.prevent="changeMonth('prev')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-5 text-gray-600"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      </button>
      <h1 class="text-gray-600 text-lg mx-5 font-bold">
        {{ selected_month }} (<select
          @change="handleChangeYear($event.target.value)"
          v-model="form_filter.year"
          class="p-0 m-0 bg-none border-0 text-gray-600"
        >
          <option
            v-for="(year, index) in year_options"
            :key="index"
            :selected="year.year == current_year"
          >
            {{ year.year }}
          </option></select
        >)
      </h1>
      <!-- Left Arrow -->
      <button
        type="button"
        v-if="selected_month !== 'December'"
        @click.prevent="changeMonth('next')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-5 text-gray-600"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>
      </button>
    </div>
    <transition name="content-slide" mode="out-in">
      <div :key="activeKey" class="content">
        <!-- Cards -->
        <div class="grid grid-cols-2">
          <!-- Budget -->
          <div
            class="border border-gray-400 rounded-md m-2 p-2 flex bg-white shadow-sm"
          >
            <div class="h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1"
                stroke="currentColor"
                class="size-8 text-[#8C1007]"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
                />
              </svg>
            </div>
            <div class="w-full px-2 text-left">
              <p class="text-[#8C1007] font-medium text-md">Budget</p>
              <p
                style="font-family: Arial, Helvetica, sans-serif !important"
                class="font-bold text-md text-[#8C1007]"
              >
                {{
                  Number(budget_data?.amount).toLocaleString("en-US", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 2,
                  })
                }}
              </p>
            </div>
          </div>
          <!-- Expense -->
          <div
            class="border border-gray-400 rounded-md m-2 p-2 flex bg-white shadow-sm"
          >
            <div class="h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1"
                stroke="currentColor"
                class="size-8 text-[#8C1007]"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                />
              </svg>
            </div>
            <div class="w-full px-2 text-left">
              <p class="text-[#8C1007] font-medium text-md">Expense</p>
              <p
                style="font-family: Arial, Helvetica, sans-serif !important"
                class="font-bold text-md text-[#8C1007]"
              >
                {{
                  Number(total_expense).toLocaleString("en-US", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 2,
                  })
                }}
              </p>
            </div>
          </div>
          <!-- Total Transaction -->
          <div
            class="border border-gray-400 rounded-md m-2 p-2 flex bg-white shadow-sm"
          >
            <div class="h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1"
                stroke="currentColor"
                class="size-8 text-[#8C1007]"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
            </div>
            <div class="w-full px-2 text-left">
              <p class="text-[#8C1007] font-medium text-md">Transactions</p>
              <p
                style="font-family: Arial, Helvetica, sans-serif !important"
                class="font-bold text-md text-[#8C1007]"
              >
                {{ total_transaction_count }}
              </p>
            </div>
          </div>
          <!-- Remaining Balance -->
          <div
            class="border border-[#6d0f09] rounded-md m-2 p-2 flex bg-[#8C1007] shadow-sm"
          >
            <div class="h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1"
                stroke="currentColor"
                class="size-8 text-white"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z"
                />
              </svg>
            </div>
            <div class="w-full px-2 text-left relative z-10">
              <p class="text-white font-medium text-md">Balance</p>
              <img class="piggy-balance" :src="`${piggy_balance}`"></img>
              <p
                style="font-family: Arial, Helvetica, sans-serif !important"
                class="font-bold text-md text-white"
              >
                {{
                  Number(current_balance).toLocaleString("en-US", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 2,
                  })
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- PROGRESS BAR -->
        <!-- Total Progress bar -->
        <div
          class="text-center mt-10"
          v-if="transaction_data_purpose.length === 0"
        >
          No Transaction for this month.
        </div>
        <div v-else class="flex flex-col m-2">
          <!-- TOTAL EXPENSE -->
          <div class="rounded-md p-5 bg-[#8C1007] shadow-sm">
            <div>
              <h1 class="text-sm text-white float-left font-bold">
                Total Expense
              </h1>
              <h1
                class="text-xs text-white mt-1 float-right italic"
                style="font-family: Arial, Helvetica, sans-serif !important"
              >
                <b>
                  {{
                    Number(total_expense).toLocaleString("en-US", {
                      style: "currency",
                      currency: "PHP",
                      minimumFractionDigits: 2,
                    })
                  }}
                </b>
                of
                {{
                  Number(budget_data?.amount).toLocaleString("en-US", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 2,
                  })
                }}
              </h1>
            </div>

            <div class="w-full mt-5 bg-gray-200 rounded-full relative">
              <div
                class="bg-red-500 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full h-4 flex items-center justify-center"
                :style="`width: ${
                  pb_total_expense > 100 ? 100 : pb_total_expense.toFixed(2)
                }%;`"
              >
                <span class="percent-num">
                  {{ pb_total_expense?.toFixed(2) }}%</span
                >
              </div>
            </div>
          </div>
          <!-- END OF TOTAL EXPENSE -->

          <!-- Today's Total Expense -->
          <!-- If Selected month / year = current month / year show the today's total expense -->
          <div v-if="todaysTotalExpenseVisibility" class="mt-4">
            <h1 class="text-sm text-center font-bold border bg-gray-100 border-gray-400 rounded-sm p-2 shadow-sm">
              Today's Total Expense (<b
                class="text-red-700"
                style="font-family: Arial, Helvetica, sans-serif !important"
              >
                {{
                  Number(todays_total_expense).toLocaleString("en-US", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 2,
                  })
                }} </b
              >)
            </h1>
          </div>

          <!-- Budget Breakdown -->
          <h1 class="text-sm float-left font-bold mt-5">Budget Breakdown</h1>
          <div class="bg-gray-100 p-1 rounded-sm">
            <!-- Purchases source progress bars -->
            <h1 class="text-sm text-center text-[#8C1007] font-bold mt-2">
              Purchase Source
            </h1>
            <ProgressBarTransactions :list="transaction_data_purchase_source" :budget_data="budget_data"/>
            <!-- PROGRESS BAR STARTS -->
            <!-- PROGRESS BAR END -->
            <!-- Purposes progress bar -->
            <h1 class="text-sm text-center text-[#8C1007] font-bold mt-5">
              Purposes
            </h1>
            <ProgressBarPurposes :list="transaction_data_purpose" :budget_data="budget_data"/>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

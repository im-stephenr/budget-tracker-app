<script setup>
import { onMounted, ref } from "vue";
import { getDB } from "/src/services/database";
import { useToast } from "vue-toast-notification";

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
const current_month = ref(months.value[d.getMonth()]);
const form = ref({
  budget: "",
  month: d.getMonth() + 1,
  year: d.getFullYear(),
});
const toast = useToast();
const budget_list = ref([]);

const handleSubmit = async () => {
  const db = getDB();

  try {
    // Check first if budget already exist
    let check = await db.query(
      "SELECT * FROM budget WHERE month=? AND year=?",
      [form.value.month, form.value.year],
    );

    if (check.values.length > 0) {
      // UPDATE THE BUDGET
      let save = await db.run(
        "UPDATE budget SET amount=? WHERE month=? AND year=?",
        [form.value.budget, form.value.month, form.value.year],
      );
    } else {
      // INSERT BUDGET
      let save = await db.run(
        "INSERT INTO budget(amount, month, year) VALUES(?,?,?)",
        [form.value.budget, form.value.month, form.value.year],
      );
    }
    // clear form
    form.value.month = d.getMonth() + 1;
    form.value.year = d.getFullYear();
    form.value.budget = "";
    // Load List
    loadBudget();

    toast.success("SUCCESS! Budget Updated Successfully!", {
      position: "top",
    });
  } catch (err) {
    console.log("Error", err);
  }
};

// Handle Edit
const handleEdit = (amount, month, year) => {
  form.value.budget = amount;
  form.value.month = month;
  form.value.year = year;
};

// Handle Delete
const handleDelete = async (id) => {
  try {
    if (!confirm("Are you sure you want to delete this budget?")) return false;
    const db = getDB();
    let del = await db.run("DELETE FROM budget WHERE id=?", [id]);
    toast.success("SUCCESS! Budget DELETED Successfully.", {
      position: "top",
    });
    loadBudget();
  } catch (err) {
    console.log("Error", err);
  }
};

const loadBudget = async () => {
  try {
    const db = getDB();
    let fetch = await db.query("SELECT * FROM budget ORDER BY id DESC");
    if (fetch.values.length > 0) {
      budget_list.value = fetch.values;
    }
  } catch (err) {
    console.log("Error", err);
  }
};

function getMonthFullName(monthNumber) {
  // Create a Date object. The month parameter in the Date constructor is 0-indexed,
  // so subtract 1 from the input monthNumber. The day and year don't matter
  // for extracting the month name.
  const date = new Date(2000, monthNumber - 1, 1);

  // Use toLocaleString() to get the full month name.
  // 'default' uses the user's default locale, or you can specify one like 'en-US'.
  // { month: 'long' } specifies that the full month name should be returned.
  const monthName = date.toLocaleString("default", { month: "long" });

  return monthName;
}

onMounted(async () => {
  await loadBudget();
});
</script>
<template>
  <div class="p-5">
    <form class="max-w-md mx-auto" @submit.prevent="handleSubmit">
      <div class="relative z-0 w-full mb-5 group">
        <input
          v-model="form.budget"
          type="number"
          name="budget"
          id="budget"
          class="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-gray-400 appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
          placeholder=" "
          required
        />
        <label
          for="budget"
          class="absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
          >Amount</label
        >
      </div>
      <div class="relative z-0 w-full mb-5 group">
        <select
          v-model="form.month"
          id="month"
          class="block py-2.5 ps-0 w-full text-sm text-body bg-transparent border-0 border-b-2 border-gray-400 appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
        >
          <option
            v-for="(month, index) in months"
            :key="index"
            :value="index + 1"
          >
            {{ month }}
          </option>
        </select>
      </div>

      <button
        type="submit"
        class="text-white font-bold w-full rounded-sm bg-[#660B05] hover:bg-[#88211a] box-border border border-transparent leading-5 rounded-base text-md px-4 py-2.5 text-center"
      >
        UPDATE
      </button>
    </form>

    <!-- BUDGET LIST -->
    <div class="flex flex-col mt-10">
      <h1 class="text-xl">Budget History</h1>
      <div class="-m-1.5 overflow-x-auto">
        <div class="p-1.5 min-w-full inline-block align-middle">
          <div class="overflow-scroll h-screen">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                  >
                    Month
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                  >
                    Year
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(budget, i) in budget_list" :key="i">
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800"
                  >
                    {{ budget.amount }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800"
                  >
                    {{ getMonthFullName(budget.month) }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800"
                  >
                    {{ budget.year }}
                  </td>

                  <td class="flex p-2 gap-2">
                    <!-- Edit -->
                    <button
                      @click.prevent="
                        handleEdit(budget.amount, budget.month, budget.year)
                      "
                      type="button"
                      title="Delete"
                      class="inline-flex items-center gap-x-2 text-sm bg-green-500 active:bg-green-700 p-2 rounded-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-4 text-white"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                    <!-- Delete -->
                    <button
                      @click.prevent="handleDelete(budget.id)"
                      type="button"
                      title="Delete"
                      class="inline-flex items-center gap-x-2 text-sm bg-red-500 active:bg-red-700 p-2 rounded-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-4 text-white"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

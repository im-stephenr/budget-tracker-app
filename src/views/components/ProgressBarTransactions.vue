<script setup>
const props = defineProps({
  list: Object,
  budget_data: Object,
});
</script>
<template>
  <!-- PROGRESS BAR STARTS -->
  <div v-for="(transaction, i) in list" :key="i" class="m-2">
    <div>
      <p class="text-xs float-left">{{ transaction.name }}</p>
      <p
        class="text-xs float-right"
        style="font-family: Arial, Helvetica, sans-serif !important"
      >
        <b>
          {{
            budget_data?.amount
              ? Number(transaction.total_expense).toLocaleString("en-US", {
                  style: "currency",
                  currency: "PHP",
                  minimumFractionDigits: 2,
                })
              : Number(0).toLocaleString("en-US", {
                  style: "currency",
                  currency: "PHP",
                  minimumFractionDigits: 2,
                })
          }}
        </b>
      </p>
    </div>
    <br />
    <div class="w-full bg-gray-200 rounded-full relative">
      <div
        :class="`text-xs  text-white p-0.5 leading-none rounded-full h-4 flex items-center justify-center `"
        :style="
          (() => {
            const amount = budget_data?.amount || 0;
            const percentage = amount
              ? Math.min((transaction.total_expense / amount) * 100, 100)
              : 0;

            return `width:${percentage}%; background-color:${transaction.color.toUpperCase()};`;
          })()
        "
      >
        <span class="percent-num">
          {{
            budget_data?.amount
              ? (
                  (transaction.total_expense / budget_data.amount) *
                  100
                ).toFixed(2)
              : "0.00"
          }}%
        </span>
      </div>
    </div>
  </div>
  <!-- PROGRESS BAR END -->
</template>

<script setup>
import { onMounted, ref } from "vue";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { useToast } from "vue-toast-notification";
import { getDB } from "/src/services/database";

const form = ref({
  amount: "",
  product: "",
  category: "",
  payment_method: "",
  date: "",
  purpose: "",
  image: "",
});
const categories = ref([]);
const purposes = ref([]);
const payment_methods = ref([]);

const toast = useToast();

const handleSubmit = async () => {
  // Handle form submission logic here
  console.log("Form submitted:", form.value);
  const db = getDB();
  try {
    let result = await db.run(
      "INSERT INTO transactions (amount, product, category_id, payment_method_id, date, image_path, note, purpose_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        form.value.amount,
        form.value.product,
        form.value.category,
        form.value.payment_method,
        form.value.date,
        form.value.image,
        form.value.note,
        form.value.purpose,
      ],
    );
    toast.success("Transaction Added Successfully!", {
      position: "top",
    });
    autoClearForm();
  } catch (err) {
    console.log("Error:", err);
  }
};

const autoClearForm = () => {
  // Clear the form
  form.value.amount = "";
  form.value.product = "";
  form.value.category = "";
  form.value.payment_method = "";
  form.value.date = "";
  form.value.image = "";
  form.value.note = "";
  form.value.purpose = "";
};

// Handle file upload
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async () => {
    const base64Data = reader.result.split(",")[1];

    const dir = "photos";

    // 1️⃣ Make sure the folder exists
    try {
      await Filesystem.stat({
        path: dir,
        directory: Directory.Data,
      });
    } catch (e) {
      await Filesystem.mkdir({
        path: dir,
        directory: Directory.Data,
        recursive: true,
      });
    }

    // 2️⃣ Save the file
    const fileName = `${dir}/image_${Date.now()}.jpg`;

    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    // 3️⃣ Store path in DB/UI
    form.value.image = fileName;
  };

  reader.readAsDataURL(file);
};

// Load Payment
const loadPaymentMethods = async () => {
  const db = getDB();
  try {
    let fetch = await db.query("SELECT * FROM payment_methods");
    if (fetch.values.length > 0) {
      payment_methods.value = fetch.values;
    }
  } catch (err) {
    console.log("Error: ", err);
  }
};

// Load Categories
const loadCategories = async () => {
  const db = getDB();
  try {
    let fetch = await db.query("SELECT * FROM categories");
    if (fetch.values.length > 0) {
      categories.value = fetch.values;
    }
  } catch (err) {
    console.log("Error: ", err);
  }
};
// Load Purpose
const loadPurposes = async () => {
  const db = getDB();
  try {
    let fetch = await db.query("SELECT * FROM purposes");
    if (fetch.values.length > 0) {
      purposes.value = fetch.values;
    }
  } catch (err) {
    console.log("Error: ", err);
  }
};

onMounted(async () => {
  await loadCategories();
  await loadPaymentMethods();
  await loadPurposes();
});
</script>
<template>
  <div class="flex flex-col overflow-y-scroll">
    <form class="w-full px-5 mx-auto mt-5" @submit.prevent="handleSubmit">
      <div class="relative z-0 w-full mb-5 group">
        <input
          type="number"
          name="amount"
          id="amount"
          class="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-gray-400 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
          placeholder=" "
          required
          v-model="form.amount"
        />
        <label
          for="amount"
          class="absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
          >Amount</label
        >
      </div>
      <div class="relative z-0 w-full mb-5 group">
        <input
          type="text"
          name="product"
          id="product"
          class="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-gray-400 border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
          placeholder=" "
          required
          v-model="form.product"
        />
        <label
          for="product"
          class="absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
          >Product</label
        >
      </div>
      <div class="relative z-0 w-full mb-5 group">
        <label for="category" class="sr-only">Purchase Source</label>
        <select
          id="category"
          v-model="form.category"
          class="block py-2.5 ps-0 w-full text-sm text-body bg-transparent border-0 border-b-2 border-gray-400 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
        >
          <option value="" selected>Purchase Source</option>
          <option
            v-for="(category, i) in categories"
            :key="i"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>
      <div class="relative z-0 w-full mb-5 group">
        <label for="purpose" class="sr-only">Purpose</label>
        <select
          id="purpose"
          v-model="form.purpose"
          class="block py-2.5 ps-0 w-full text-sm text-body bg-transparent border-0 border-b-2 border-gray-400 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
        >
          <option value="" selected>Purpose</option>
          <option v-for="(purpose, i) in purposes" :key="i" :value="purpose.id">
            {{ purpose.name }}
          </option>
        </select>
      </div>
      <div class="relative z-0 w-full mb-8 group">
        <label for="payment_method" class="sr-only">Payment Method</label>
        <select
          id="payment_method"
          v-model="form.payment_method"
          class="block py-2.5 ps-0 w-full text-sm text-body bg-transparent border-0 border-b-2 border-gray-400 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
        >
          <option value="" selected>Payment Method</option>
          <option
            v-for="(payment_method, i) in payment_methods"
            :value="payment_method.id"
          >
            {{ payment_method.name }}
          </option>
        </select>
      </div>
      <div class="relative z-0 w-full mb-5 group">
        <input
          type="date"
          v-model="form.date"
          name="date_spend"
          id="date_spend"
          class="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-gray-400 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
          placeholder=" "
          required
        />
        <label
          for="date_spend"
          class="absolute text-md text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
          >Date
        </label>
      </div>
      <div class="relative z-0 w-full mb-5 group">
        <label class="block">
          <span class="text-sm text-body">Upload Image</span>
          <input
            type="file"
            @change="handleFileUpload"
            class="block w-full text-sm text-gray-500 file:me-4 file:py-2 file:px-4 border-gray-400 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-400 file:disabled:opacity-50 file:disabled:pointer-events-none"
          />
        </label>
      </div>
      <div class="relative z-0 w-full mb-5 group">
        <label for="note" class="text-sm text-body">Note</label>
        <textarea
          id="note"
          rows="4"
          v-model="form.note"
          class="bg-neutral-secondary-medium border border-default-medium text-heading border-gray-400 text-sm rounded-base focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-body"
          placeholder="Write your thoughts here..."
        ></textarea>
      </div>
      <div class="relative z-0 w-full mb-15 group">
        <button
          type="submit"
          class="text-white font-bold w-full rounded-sm bg-[#660B05] hover:bg-[#88211a] box-border border border-transparent leading-5 rounded-base text-md px-4 py-2.5 text-center"
        >
          SUBMIT
        </button>
      </div>
    </form>
  </div>
</template>

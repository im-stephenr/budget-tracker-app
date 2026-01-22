<script setup>
import { onMounted, ref } from "vue";
import { useToast } from "vue-toast-notification";
import { getDB } from "/src/services/database";

const toast = useToast();
const form = ref({
  name: "",
  email: "",
  pin: "",
  confirm_pin: "",
});
const profile_data = ref([]);

const handleSubmit = async () => {
  const db = getDB();
  try {
    if (form.value.pin != form.value.confirm_pin) {
      toast.warning("WARNING! Pin and Confirm pin did not match.", {
        position: "top",
      });
      return false;
    }
    let check = await db.query("SELECT * FROM profile LIMIT 1");
    let exists = check.values.length;
    if (exists > 0) {
      await db.run("UPDATE profile SET name=?, email=?, pin=?", [
        form.value.name,
        form.value.email,
        form.value.pin,
      ]);
    } else {
      await db.run("INSERT INTO profile (name, email, pin) VALUES(?,?,?)", [
        form.value.name,
        form.value.email,
        form.value.pin,
      ]);
    }
    toast.success("SUCCESS! Profile UPDATED Successfully.", {
      position: "top",
    });
  } catch (err) {
    console.log("Error: ", err);
  }
};
// Load Data
const handleLoadData = async () => {
  const db = getDB();
  try {
    let fetch = await db.query("SELECT * FROM profile LIMIT 1");
    if (fetch.values.length > 0) {
      form.value.id = fetch.values[0].id;
      form.value.name = fetch.values[0].name;
      form.value.email = fetch.values[0].email;
      form.value.pin = fetch.values[0].pin;
    }
  } catch (err) {
    console.log("Error: ", err);
  }
};

onMounted(async () => {
  await handleLoadData();
});
</script>
<template>
  <div>
    <!-- Breadcrumbs -->
    <div class="flex m-2">
      <span class="text-xs text-gray-400">Settings / Manage Profile</span>
    </div>
    <div class="p-5">
      <!-- FORM -->
      <form class="max-w-md mx-auto" @submit.prevent="handleSubmit">
        <div class="relative z-0 w-full mb-5 group">
          <input
            v-model="form.name"
            type="text"
            name="name"
            id="name"
            class="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            placeholder=" "
            required
          />
          <label
            for="name"
            class="absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
            >Name</label
          >
        </div>
        <div class="relative z-0 w-full mb-5 group">
          <input
            v-model="form.email"
            type="email"
            name="email"
            id="email"
            class="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            placeholder=" "
            required
          />
          <label
            for="email"
            class="absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
            >Email</label
          >
        </div>
        <div class="relative z-0 w-full mb-5 group">
          <input
            v-model="form.pin"
            type="password"
            name="pin"
            id="pin"
            class="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            placeholder=" "
            required
            minlength="1"
            maxlength="4"
          />
          <label
            for="pin"
            class="absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
            >Pin</label
          >
        </div>
        <div class="relative z-0 w-full mb-5 group">
          <input
            v-model="form.confirm_pin"
            type="password"
            name="confirm_pin"
            id="confirm_pin"
            class="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            placeholder=" "
            required
            minlength="1"
            maxlength="4"
          />
          <label
            for="confirm_pin"
            class="absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
            >Confirm Pin</label
          >
        </div>
        <button
          type="submit"
          class="text-white font-bold w-full rounded-sm bg-[#660B05] hover:bg-[#88211a] box-border border border-transparent leading-5 rounded-base text-md px-4 py-2.5 text-center"
        >
          UPDATE
        </button>
      </form>
    </div>
  </div>
</template>

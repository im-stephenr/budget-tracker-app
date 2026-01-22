import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-bootstrap.css";
import { initDB } from "./services/database";
import "@tailwindplus/elements";

async function bootstrap() {
  console.log("Initializing SQLite DB...");
  await initDB(); // ⬅⬅ FULLY wait for the DB to finish

  console.log("SQLite DB initialized — starting Vue app...");

  createApp(App).use(router).use(ToastPlugin).mount("#app");
}

bootstrap();

import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";
import "vue-sonner/style.css";
import App from "./App.vue";
import "./assets/tailwind-shadcn.css";
import router from "./router";
import "@/lib/echo"; 

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
pinia.use(piniaPluginPersistedstate);

app.mount("#app");

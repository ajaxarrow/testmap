import './styles/global.css'
import 'maplibre-gl/dist/maplibre-gl.css';
import vuetify from "./plugins/vuetify.ts";
import PhosphorIcons from "@phosphor-icons/vue";
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(vuetify);
app.use(PhosphorIcons);
app.mount('#app')

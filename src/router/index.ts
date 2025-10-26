import mapRoutes from '@/modules/map/routes'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...mapRoutes
  ],
})

export default router

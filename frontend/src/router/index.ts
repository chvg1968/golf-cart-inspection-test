import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import NewInspection from '@/views/NewInspection.vue'
import CompleteInspection from '@/views/CompleteInspection.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'NewInspection',
    component: NewInspection
  },
  {
    path: '/complete-inspection/:token',
    name: 'CompleteInspection',
    component: CompleteInspection,
    props: true
  },
  {
    path: '/inspection-completed',
    name: 'InspectionCompleted',
    component: () => import('@/views/InspectionCompleted.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router

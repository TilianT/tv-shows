import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Preserve scroll on browser back/forward.
    if (savedPosition) return savedPosition

    return { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      meta: { keepAlive: true },
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/show/:id',
      name: 'details',
      component: () => import('@/views/DetailsView.vue'),
      props: (route) => ({ id: parseInt(route.params.id as string) }),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/FavoritesView.vue'),
    },
    {
      path: '/genre/:genre',
      name: 'genre',
      component: () => import('@/views/GenreView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
    },
  ],
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: () => import('../views/HomeView.vue') },
    {
      path: '/admin',
      component: () =>
        import('../views/AdminView.vue') /*, meta: { requiresAuth: true, role: 'admin' } */,
    },
    {
      path: '/job',
      component: () =>
        import('../views/JobView.vue') /*, meta: { requiresAuth: true, role: 'pm' } */,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // Initialisiere Store falls noch nicht geschehen
  if (!userStore.isAuthenticated && userStore.getToken()) {
    userStore.initialize()
  }

  const userRole = userStore.role
  const isAuthenticated = userStore.isAuthenticated

  // Admin Route Protection
  if (to.path.startsWith('/admin')) {
    if (!isAuthenticated) {
      return next({ path: '/home', query: { message: 'unauthenticated' } })
    }

    // Spezielle Behandlung für Orders-Bereich - PM und Fach haben auch Zugriff
    if (to.query.section === 'orders') {
      if (!['admin', 'pm', 'fach'].includes(userRole)) {
        return next({ path: '/home', query: { message: 'insufficient_permissions' } })
      }
    } else {
      // Nur Admin hat Zugriff auf anderen Admin-Bereich
      if (userRole !== 'admin') {
        return next({ path: '/home', query: { message: 'insufficient_permissions' } })
      }
    }

    return next()
  }

  // Job Route Protection
  if (to.path.startsWith('/job')) {
    if (!isAuthenticated) {
      return next({ path: '/home', query: { message: 'unauthenticated' } })
    }

    // Admin, PM und User (fach) haben Zugriff auf Job-Bereich
    if (!['admin', 'pm', 'fach'].includes(userRole)) {
      return next({ path: '/home', query: { message: 'insufficient_permissions' } })
    }

    return next()
  }

  // Legacy meta-basierte Authentifizierung für andere Routen
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      return next({ path: '/home', query: { message: 'unauthenticated' } })
    }

    const requiredRole = to.meta.role
    if (requiredRole) {
      // Admin hat Zugriff auf alles
      if (userRole === 'admin') {
        return next()
      }

      // Prüfe spezifische Rolle
      if (userRole === requiredRole) {
        return next()
      }

      // Keine Berechtigung
      return next({ path: '/home', query: { message: 'insufficient_permissions' } })
    }
  }

  // Öffentliche Route oder keine speziellen Anforderungen
  next()
})

export default router

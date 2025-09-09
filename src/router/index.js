import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: () => import('../views/HomeView.vue') },
    { path: '/admin', component: () => import('../views/AdminView.vue')/*, meta: { requiresAuth: true, role: 'admin' } */ },
    { path: '/job', component: () => import('../views/JobView.vue')/*, meta: { requiresAuth: true, role: 'pm' } */ },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFoundView.vue') }
  ],
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const userRole = userStore.role; // 'admin', 'pm', 'user', or null

  // Prüfen, ob die Route eine Authentifizierung erfordert
  if (to.meta.requiresAuth) {
    // 1. Benutzer ist nicht angemeldet -> Weiterleitung zur Startseite mit Nachricht
    if (!userRole) {
      return next({ path: '/home', query: { message: 'unauthenticated' } });
    }

    // 2. Benutzer ist angemeldet, Berechtigungen prüfen
    const requiredRole = to.meta.role;
    if (requiredRole) {
      // Admin hat Zugriff auf alles
      if (userRole === 'admin') {
        return next();
      }
      // PM hat Zugriff auf 'pm'- und 'user'-Routen

      if (userRole === 'admin') return next({ path: '/admin' });
      if (userRole === 'pm') return next({ path: '/job' });
      if (userRole === 'fach') return next({ path: '/job' }); 
      // Fallback für andere Rollen
      return next({ path: '/home' });

    } else {
      // Route erfordert Authentifizierung, aber keine spezielle Rolle, also Zugriff erlauben
      return next();
    }
  } else {
    // Öffentliche Route, Zugriff erlauben
    return next();
  }
});

export default router
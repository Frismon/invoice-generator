import { useSyncExternalStore } from 'react';

export type Route = 'editor' | 'invoices';

const NAVIGATE = 'app:navigate';

const routeOf = (pathname: string): Route => (pathname.replace(/\/+$/, '') === '/invoices' ? 'invoices' : 'editor');

const subscribe = (notify: () => void) => {
  window.addEventListener('popstate', notify);
  window.addEventListener(NAVIGATE, notify);
  return () => {
    window.removeEventListener('popstate', notify);
    window.removeEventListener(NAVIGATE, notify);
  };
};

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => routeOf(window.location.pathname));
}

export function navigate(to: Route, search = '') {
  const path = to === 'invoices' ? '/invoices' : '/';
  window.history.pushState(null, '', `${path}${search}`);
  window.dispatchEvent(new Event(NAVIGATE));
  window.scrollTo(0, 0);
}

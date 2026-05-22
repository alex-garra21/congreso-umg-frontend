/** Marca en sessionStorage: la siguiente carga debe limpiar caché local (F5 / recargar pestaña). */
export const HARD_REFRESH_CACHE_FLAG = 'app_hard_refresh_clear';

/** Clave de localStorage para guardar la marca de tiempo de la última recarga manual. */
export const LAST_REFRESH_TIME_KEY = 'app_last_refresh_time';

/** Tiempo de espera requerido entre recargas manuales (10 minutos). */
export const REFRESH_COOLDOWN_MS = 10 * 60 * 1000;

/**
 * Claves de localStorage que no se borran al actualizar.
 * - sb-*: sesión y tokens de Supabase Auth
 * - is_recovering_pw: flujo de recuperación de contraseña
 * - app_last_refresh_time: timestamp de la última recarga para control de cooldown
 */
export function shouldPreserveLocalStorageKey(key: string): boolean {
  if (key.startsWith('sb-')) return true;
  if (key === 'is_recovering_pw') return true;
  if (key === LAST_REFRESH_TIME_KEY) return true;
  return false;
}

/** Elimina caché de app en localStorage sin cerrar sesión. */
export function clearAppLocalStorageCache(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !shouldPreserveLocalStorageKey(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/** Al recargar la pestaña (F5), limpiar caché en la siguiente visita. */
export function registerHardRefreshCacheClear(): void {
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem(HARD_REFRESH_CACHE_FLAG, '1');
  });
}

/** Ejecutar una sola vez al arrancar la app tras F5. */
export function applyHardRefreshCacheClearIfNeeded(): void {
  if (sessionStorage.getItem(HARD_REFRESH_CACHE_FLAG) !== '1') return;
  sessionStorage.removeItem(HARD_REFRESH_CACHE_FLAG);
  clearAppLocalStorageCache();
}

/** Calcula cuántos milisegundos restan del cooldown de 10 minutos. */
export function getRemainingRefreshCooldown(): number {
  const lastRefresh = localStorage.getItem(LAST_REFRESH_TIME_KEY);
  if (!lastRefresh) return 0;

  const elapsed = Date.now() - parseInt(lastRefresh, 10);
  const remaining = REFRESH_COOLDOWN_MS - elapsed;
  return remaining > 0 ? remaining : 0;
}

/** Determina si es permitido realizar una nueva recarga manual. */
export function canRefreshApp(): boolean {
  return getRemainingRefreshCooldown() === 0;
}

/**
 * Limpia caché local y recarga la página si no está en cooldown.
 * Retorna true si se inició la recarga, o false si está bloqueado por cooldown.
 */
export function refreshAppPage(): boolean {
  if (!canRefreshApp()) {
    return false;
  }

  // Establecer el timestamp antes de vaciar la caché (shouldPreserve lo protegerá)
  localStorage.setItem(LAST_REFRESH_TIME_KEY, Date.now().toString());
  clearAppLocalStorageCache();
  window.location.reload();
  return true;
}

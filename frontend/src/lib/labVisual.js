export function shouldUseLab3D() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(max-width: 767px)').matches) return false;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /2g/.test(connection.effectiveType)) return false;
  return true;
}

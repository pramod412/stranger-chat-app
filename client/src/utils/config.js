/**
 * Centralized API & Server Configuration
 * Seamlessly resolves backend URL from environment variables, local dev, or production host.
 */

export const getServerUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
  }
  return window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
};

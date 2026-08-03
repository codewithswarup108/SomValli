export const BASE_API_URL = import.meta.env.VITE_API_URL || '';

export const apiUrl = (path: string) => `${BASE_API_URL}${path}`;

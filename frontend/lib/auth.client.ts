'use client';
import { jwtDecode } from 'jwt-decode';

export function getToken(): string | null {
  const found = document.cookie.split('; ').find(r => r.startsWith('token='));
  return found ? decodeURIComponent(found.split('=')[1]) : null;
}

export function getUsernameFromToken(): string {
  try {
    const t = getToken();
    if (!t) return '';
    const payload: any = jwtDecode(t);
    return payload?.username || payload?.sub || '';
  } catch {
    return '';
  }
}

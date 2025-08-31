// frontend/services/api.js
import { normalizeError } from '@/utils/http-errors';
export const apiUrl = (p) => `/api${p.startsWith('/') ? p : `/${p}`}`;
async function parseJsonSafe(res){ try { return await res.json(); } catch { return null; } }
async function handle(res){
  if(!res.ok){
    const body = await parseJsonSafe(res);
    const { message } = normalizeError(body || res);
    throw new Error(message);
  }
  const data = await parseJsonSafe(res);
  return { data };
}
export async function get(path){ try{ return await handle(await fetch(apiUrl(path),{credentials:'include'})); } catch(e){ throw new Error(normalizeError(e).message); } }
export async function post(path,body){ try{ return await handle(await fetch(apiUrl(path),{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(body)})); } catch(e){ throw new Error(normalizeError(e).message); } }
export async function postForm(path,formData){ try{ return await handle(await fetch(apiUrl(path),{method:'POST',credentials:'include',body:formData})); } catch(e){ throw new Error(normalizeError(e).message); } }
export async function del(path){ try{ return await handle(await fetch(apiUrl(path),{method:'DELETE',credentials:'include'})); } catch(e){ throw new Error(normalizeError(e).message); } }
const api = { get, post, postForm, del };
export default api;

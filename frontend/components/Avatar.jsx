import React from 'react';

/**
 * Avatar robusto:
 * - Aceita `src` string OU `user` objeto (avatarUrl, avatar, photo, image, picture).
 * - Normaliza http://backend:4000/... -> /uploads/...
 * - Se `src` vier 'uploads/...' sem barra, adiciona '/'
 * - Fallback para '/generic_user.png' somente quando realmente não existir foto.
 * - Último fallback: letra inicial.
 */
function pickUserSrc(user) {
  if (!user || typeof user !== 'object') return null;
  return user.avatarUrl || user.avatar || user.photo || user.image || user.picture || null;
}

function normalizePath(path) {
  if (!path) return null;
  let s = String(path).trim();
  if (!s) return null;

  // Se vier URL absoluta para backend/localhost, converte para caminho relativo
  const m = s.match(/^https?:\/\/(backend|localhost)(?::\d+)?(\/.*)$/i);
  if (m) s = m[2];

  // Se vier sem barra inicial (ex.: 'uploads/avatars/x.jpg'), adiciona
  if (!/^\//.test(s)) s = '/' + s;

  return s;
}

export default function Avatar({ src, user = null, name = 'Usuário', size = 40, className = '' }) {
  const letter = (name || 'U').trim()[0]?.toUpperCase() || 'U';

  // Resolve origem
  const provided = typeof src === 'string' ? src : pickUserSrc(src) || pickUserSrc(user);
  console.log("Avatar - URL original:", provided);
  const norm = normalizePath(provided);
  console.log("Avatar - URL normalizada:", norm);
  const finalSrc = norm || '/generic_user.png';

  return (
    <img
      src={finalSrc}
      alt={name}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        e.currentTarget.outerHTML = `<div style="width:${size}px;height:${size}px" class="flex items-center justify-center rounded-full bg-gray-300 text-gray-700">${letter}</div>`;
      }}
    />
  );
}

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createNatsClient } from '@/lib/nats';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = { sub: string; exp: number; iat: number; username?: string };

function getCookie(name: string) {
  return document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1] ?? '';
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  function checkToken() {
    const token = getCookie('token');
    setIsLoggedIn(!!token);
  }

  useEffect(() => { setMounted(true); checkToken(); }, []);
  useEffect(() => { checkToken(); }, [pathname]);

  useEffect(() => {
    if (!isLoggedIn) return;

    let stop = false;
    let timer: any;
    let natsConn: Awaited<ReturnType<typeof createNatsClient>> | null = null;

    (async () => {
      try {
        const token = getCookie('token');
        const { sub: userId } = jwtDecode<JwtPayload>(token);
        natsConn = await createNatsClient();
        if (!natsConn || stop) return;

        const sendBeat = async () => {
          try {
            await natsConn!.pub('presence.heartbeat', { userId, ts: Date.now() });
          } catch {}
        };

        await sendBeat();
        timer = setInterval(sendBeat, 10_000);
      } catch {}
    })();

    return () => {
      stop = true;
      if (timer) clearInterval(timer);
      try { natsConn?.close(); } catch {}
    };
  }, [isLoggedIn]);

  if (!mounted) return null;

  function logout() {
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsLoggedIn(false);
    router.push('/login');
  }

  const navButton = (label: string, href: string) => {
    const isActive = pathname === href;
    return (
      <a href={href} className={`btn ${isActive ? 'border-yellow-400 border-2' : 'border-transparent'}`}>
        {label}
      </a>
    );
  };

  return (
    <div className="container py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">IXC Frontend</h1>
        <nav className="flex gap-3 text-sm">
          {!isLoggedIn ? (
            <>
              {navButton('Login', '/login')}
              {navButton('Registrar', '/register')}
            </>
          ) : (
            <>
              {navButton('Dashboard', '/dashboard')}
              <button className="btn bg-red-500 hover:bg-red-600 text-white" onClick={logout}>Deslogar</button>
            </>
          )}
        </nav>
      </header>
      {children}
    </div>
  );
}

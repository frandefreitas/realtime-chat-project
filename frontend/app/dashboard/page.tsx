'use client';
import { useEffect, useState } from 'react';
import { startPresenceHeartbeat, stopPresenceHeartbeat } from '@/lib/presence';
import UserList from '@/components/UserList';
import ChatBox from '@/components/ChatBox';
import { useRouter } from 'next/navigation';

function getCookie(name: string): string | null {
  const part = document.cookie.split('; ').find(r => r.startsWith(name + '='));
  return part ? decodeURIComponent(part.split('=')[1]) : null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState('');
  const [peer, setPeer] = useState<{ username: string; online: boolean } | null>(null);

  useEffect(() => {
    const u = getCookie('username');
    const t = getCookie('token');
    if (!u || !t) { router.push('/login'); return; }
    setMe(u);
    startPresenceHeartbeat(u);
    return () => stopPresenceHeartbeat();
  }, [router]);

  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-4">
      <aside className="border rounded p-3">
        <UserList me={me} selected={peer?.username} onSelect={setPeer} />
      </aside>

      <section className="border rounded">
        {me && peer ? (
          peer.online ? (
            <ChatBox me={me} peer={peer.username} />
          ) : (
            <div className="p-6 opacity-60">
              Usuário @{peer.username} está offline.  
              Você só pode enviar mensagens para usuários online.
            </div>
          )
        ) : (
          <div className="p-6 opacity-60">Selecione um usuário ao lado para começar a conversar.</div>
        )}
      </section>
    </div>
  );
}

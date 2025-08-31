import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Avatar from './Avatar'

export default function ChatHeader({ me: initialMe }) {
  const [me, setMe] = useState(initialMe)
  const [busy, setBusy] = useState(false)           // <-- cria o estado busy
  const router = useRouter()

  useEffect(() => { setMe(initialMe) }, [initialMe])

  useEffect(() => {
    if (!me) {
      const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '')
      const ROOT = API.endsWith('/api') ? API.slice(0, -4) : API
      fetch(`${API}/auth/me`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.authenticated) {
            const u = d.user || {}
            const avatarUrl = u.avatarUrl ? (u.avatarUrl.startsWith('http') ? u.avatarUrl : `${ROOT}${u.avatarUrl}`) : null
            setMe({ ...u, avatarUrl })
          }
        }).catch(() => { })
    }
  }, [me])

  const username = me?.username || 'Usuário'
  const avatarSrc = me?.avatarUrl || null

  const handleLogout = async () => {
    try {
      setBusy(true)                                   // <-- marca ocupado
      const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '')
      const res = await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      if (res.ok) {
        setMe(null)
        router.push('/login')
      } else {
        const data = await res.json().catch(() => ({}))
        console.error('Erro ao deslogar:', data?.error || res.status)
        setBusy(false)                                // <-- libera em caso de erro
      }
    } catch (err) {
      console.error('Falha na requisição de logout', err)
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-5 border-b">
      <h1 className="text-xl font-semibold">Mensagens</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-semibold">{username}</div>
        </div>
        <Avatar name={username} src={avatarSrc} size={40} />
        <button
          onClick={handleLogout}
          disabled={busy}
          className="ml-1 px-5 py-2 rounded-lg text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(90deg, #4a007a 0%, #19003a 50%, #26004d 100%)",
          }}
          aria-label="Sair"
        >
          {busy ? "Saindo..." : "Sair →"}
        </button>
      </div>
    </div>
  )
}

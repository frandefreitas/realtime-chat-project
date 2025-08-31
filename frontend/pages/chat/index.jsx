import * as apiModule from '@/services/api';
const api = apiModule.default || apiModule;
import { useContext, useEffect, useRef, useState } from 'react'
import ChatHeader from '@/components/ChatHeader'
import ChatSidebar from '@/components/ChatSidebar'
import MessageBubble from '@/components/MessageBubble'
import InputBar from '@/components/InputBar'
import { AuthContext } from '../_app'
import { createSocket } from '@/utils/socket'
import { toast } from 'react-hot-toast'
import { requestNotificationPermission } from '@/utils/notifications'

export default function ChatPage() {
  const { user } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)
  const viewRef = useRef(null)

  // ---- helper para rolar pro fim
  function scrollToBottom(behavior = 'smooth') {
    const el = viewRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }

  useEffect(() => {
    if (!user) return
    api.get('/users')
      .then(({ data }) => {
        const usersList = data?.users || []
        setUsers(Array.isArray(usersList) ? usersList : [])
      })
      .catch(() => setUsers([]))
  }, [user])

  useEffect(() => {
    const setupNotifications = async () => {
      const granted = await requestNotificationPermission();
      console.log('Permissão de notificação concedida:', granted);
    };
    setupNotifications();
  }, [])

  useEffect(() => {
    if (!user) return
    const s = createSocket()
    socketRef.current = s
    s.connect()

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    s.on('connect_error', () => setConnected(false))

    s.on('user:status', (payload) => {
      setUsers(prev => prev.map(u => u._id === payload.userId ? { ...u, online: payload.online } : u))
    })

    s.on('users:online', (onlineUserIds) => {
      setUsers(prev => prev.map(u => ({ ...u, online: onlineUserIds.includes(u._id) })))
    })

    let typingTimeout
    s.on('typing:update', ({ userId, typing }) => {
      if (!active || active._id !== userId) return
      setTyping(typing)
      if (typing && typingTimeout) {
        clearTimeout(typingTimeout)
        typingTimeout = setTimeout(() => setTyping(false), 3000)
      }
    })

    s.on('message:new', (msg) => {
      if (!msg?._id || !msg?.text) return;

      if (msg.to === user._id) {
        const sender = users.find(u => u._id === msg.from);
        if (sender && (!document.hasFocus() || msg.from !== active?._id)) {
          new Audio('/notification.mp3').play().catch(() => {});
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{sender.name}</p>
                    <p className="mt-1 text-sm text-gray-500">{msg.text}</p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => { toast.dismiss(t.id); setActive(sender); }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                >Ver</button>
              </div>
            </div>
          ), { duration: 5000, position: 'top-right' });
        }
      }

      if (!active) return;
      const isRelevant = (msg.from === active._id && msg.to === user._id) || (msg.from === user._id && msg.to === active._id);
      if (!isRelevant) return;

      setMessages(prev => {
        const exists = prev.some(m => m._id === msg._id);
        if (exists) return prev;
        const next = [...prev, msg].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
        return next;
      });
      scrollToBottom();
    })

    return () => {
      s.off('user:status'); s.off('message:new'); s.disconnect()
    }
  }, [user, active?._id])

  useEffect(() => {
    if (!active || !user) return
    api.get(`/messages/${active._id}`)
      .then(({ data }) => {
        setMessages(Array.isArray(data) ? data : []);
        requestAnimationFrame(() => scrollToBottom('auto')) // sem animação ao trocar
      })
      .catch(() => { setMessages([]); console.error('Erro ao carregar mensagens'); });
  }, [active, user])

  useEffect(() => {
    if (!active) return
    scrollToBottom('auto')
  }, [active?._id, messages.length])

  function handleSend(text) {
    if (!text?.trim()) return;
    const msg = { to: active._id, text: text.trim() }
    socketRef.current?.emit('message:send', msg, ({ ok, message, error }) => {
      if (!ok) { console.error('Erro ao enviar mensagem:', error); return }
      setMessages(prev => (prev.some(m => m._id === message._id) ? prev : [...prev, message]))
      scrollToBottom()
    })
  }

  return (
    <div className="min-h-screen p-6">
      {/* card agora é um flex container em coluna e usa h-full, sem altura fixa */}
      <div className="card overflow-hidden mx-auto flex flex-col h-full" style={{ maxWidth: 1200 }}>
        <ChatHeader me={user} />
        {/* grid ocupa o restante: flex-1 e min-h-0 (permite o filho rolar) */}
        <div className="grid grid-cols-[20rem,1fr] flex-1 min-h-0">
          <ChatSidebar
            users={user && Array.isArray(users) ? users.filter(u => u && u._id !== user._id) : []}
            activeUserId={active?._id}
            onSelect={setActive}
          />
          {/* seção também sem altura fixa: usa min-h-0 p/ liberar overflow do filho */}
          <section className="flex flex-col min-h-0">
            {active ? (
              <>
                {/* lista de mensagens é a área rolável: flex-1 + min-h-0 */}
                <div ref={viewRef} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-gray-50">
                  {Array.isArray(messages) ? messages.map(m => {
                    const sender = m?.from === user?._id ? user : users.find(u => u._id === m?.from);
                    return (
                      <MessageBubble
                        key={m?._id || Math.random()}
                        mine={m?.from === user?._id}
                        text={m?.text || ''}
                        timestamp={m?.createdAt}
                        sender={sender}
                      />
                    );
                  }) : null}
                </div>
                <InputBar onSend={handleSend} disabled={!connected} />
              </>
            ) : (
              <div className="flex-1 min-h-0 grid place-items-center text-gray-500">Selecione alguém para conversar</div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

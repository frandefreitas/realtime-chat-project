import '@/styles/focus-fix.css';
import * as apiModule from '@/services/api';
const api = apiModule.default || apiModule;
import '@/styles/globals.css'
import { createContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Toaster, toast } from 'react-hot-toast'

export const AuthContext = createContext({ user: null, setAuth: () => {} })

export default function App({ Component, pageProps }) {
  const [auth, setAuth] = useState({ user: null })
  const router = useRouter()

  useEffect(() => { document.body.classList.toggle('auth-bg', /^(\/login|\/register)$/.test(router.pathname));
    api.get('/auth/me')
      .then(({ data }) => {
        if (data.authenticated && data.user) {
          setAuth({ user: data.user })
        } else {
          setAuth({ user: null })
          if (router.pathname.startsWith('/chat')) router.replace('/login')
        }
      })
      .catch(() => {
        setAuth({ user: null })
        if (router.pathname.startsWith('/chat')) router.replace('/login')
      })
  }, [])

  return (
    <AuthContext.Provider value={{ ...auth, setAuth }}>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#059669',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#DC2626',
            },
          },
        }}
      />
    </AuthContext.Provider>
  )
}
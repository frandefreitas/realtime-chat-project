export function getApiBase() {
  const b = process.env.NEXT_PUBLIC_API_BASE
  if (b && b.startsWith('/')) return b
  if (b && b !== 'auto') return b
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const proto = isHttps ? 'https' : 'http'
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  const port = process.env.NEXT_PUBLIC_BACKEND_PORT || '4000'
  return `${proto}://${host}:${port}/api`
}

export function getNatsWs() {
  const env = process.env.NEXT_PUBLIC_NATS_WS
  if (env && env !== 'auto') return env
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const scheme = isHttps ? 'wss' : 'ws'
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  const port = process.env.NEXT_PUBLIC_NATS_PORT || '9222'
  return `${scheme}://${host}:${port}`
}

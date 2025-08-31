import { io } from 'socket.io-client'

export function createSocket() {
  const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'
  const socket = io(url, {
    autoConnect: false,
    transports: ['websocket'],
    withCredentials: true
  })
  return socket
}

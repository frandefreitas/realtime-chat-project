import Avatar from './Avatar'

export default function ChatSidebar({ users = [], activeUserId, onSelect }) {
  return (
    <aside className="w-80 border-r h-full overflow-y-auto">
      <div className="p-4 text-sm text-gray-500">Conversas</div>
      <ul className="px-4 pb-4 space-y-3">
        {users.map(u => (
          <li key={u._id}>
            <button
              onClick={() => onSelect(u)}
              className={
                'w-full flex items-center gap-3 rounded-2xl p-3 transition ' +
                (activeUserId === u._id ? 'bg-blue-50' : 'hover:bg-gray-50')
              }
            >
              <div className="relative">
                <Avatar user={u} name={u.name} size={44} />
                {u.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">{u.name}</div>
                <div className={`text-xs ${u.online ? 'text-green-600' : 'text-gray-500'}`}>
                  {u.online ? 'Online' : 'Offline'}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

import Avatar from './Avatar'

export default function MessageBubble({ mine, text, timestamp, sender }) {
  return (
    <div className={"flex items-end gap-2 " + (mine ? "flex-row-reverse" : "flex-row")}>
      <Avatar 
        user={sender} 
        size={32} 
        className="mb-1"
      />
      <div className={(mine ? "bg-blue-600 text-white" : "bg-white") + " rounded-2xl px-4 py-2 max-w-[70%] shadow-soft"}>
        <div className="whitespace-pre-wrap">{text}</div>
        {timestamp ? <div className={"text-[10px] mt-1 " + (mine ? "text-blue-100" : "text-gray-400")}>{new Date(timestamp).toLocaleString()}</div> : null}
      </div>
    </div>
  )
}

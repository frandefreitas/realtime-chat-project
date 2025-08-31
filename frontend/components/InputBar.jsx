import { useState } from 'react'

export default function InputBar({ onSend, disabled }) {
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    onSend(content)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-center gap-3">
        <input
          className="input flex-1"
          placeholder="Digite sua mensagem aqui"
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={disabled}
        />
        <button className="btn" disabled={disabled} type="submit">
          Enviar →
        </button>
      </div>
    </form>
  )
}

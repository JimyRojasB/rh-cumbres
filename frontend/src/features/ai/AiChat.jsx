import { useState, useRef, useEffect } from 'react'
import api from '../../config/axiosConfig'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'

const SUGERENCIAS = [
  '¿Cuántos oficiales tenemos en Torre B?',
  '¿Quiénes ingresaron este mes?',
  '¿Cuántos trabajadores son Capataz?',
  'Lista los trabajadores del frente Sótano',
]

export default function AiChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: '¡Hola! Soy el asistente de RRHH. Puedo responder preguntas sobre el personal. ¿En qué te ayudo?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async (texto) => {
    const pregunta = texto || input.trim()
    if (!pregunta || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: pregunta }])
    setLoading(true)
    try {
      const { data } = await api.post('/ai/chat', { pregunta })
      setMessages(m => [...m, { role: 'bot', text: data.respuesta }])
    } catch (err) {
      const detail = err?.response?.data?.detail || ''
      const msg = detail.includes('429') || detail.includes('RESOURCE_EXHAUSTED')
        ? 'Límite de consultas alcanzado. Espera 1 minuto e intenta de nuevo.'
        : 'Error al consultar el asistente. Intenta de nuevo.'
      setMessages(m => [...m, { role: 'bot', text: msg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110"
        title="Asistente IA"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel de chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[520px] bg-white rounded-2xl shadow-2xl border border-navy-100 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-navy-800 to-navy-700 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Asistente RRHH</p>
              <p className="text-navy-300 text-xs">Impulsado por Gemini AI</p>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-amber-500' : 'bg-navy-700'}`}>
                  {msg.role === 'bot'
                    ? <Bot size={13} className="text-white" />
                    : <User size={13} className="text-white" />
                  }
                </div>
                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'bot'
                    ? 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                    : 'bg-navy-700 text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <Loader2 size={16} className="animate-spin text-amber-500" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Sugerencias */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-1.5 flex-wrap">
              {SUGERENCIAS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs bg-navy-50 hover:bg-navy-100 text-navy-700 border border-navy-200 rounded-full px-2.5 py-1 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

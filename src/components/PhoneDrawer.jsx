import { useEffect } from 'react'
import { BrainCircuit, CircleX, MessageSquareMore, Smartphone } from 'lucide-react'

function PhoneDrawer({ isOpen, onClose, messages = [] }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const onWindowKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onWindowKeyDown)
    return () => window.removeEventListener('keydown', onWindowKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const sorted = [...messages].reverse()

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-sky-600">Inbox</p>
            <h3 className="text-xl font-bold text-slate-900">📱 手机消息</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <CircleX size={18} />
          </button>
        </header>

        {!sorted.length ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            <Smartphone className="mx-auto mb-2 text-slate-400" size={20} />
            目前没有任何新消息，先专心打工吧。
          </div>
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {sorted.map((item) => (
              <article
                key={item.id}
                className={`rounded-2xl border p-4 shadow-sm ${
                  item.isRead ? 'border-slate-200 bg-white' : 'border-sky-200 bg-sky-50'
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{item.sender}</p>
                  <p className="text-xs text-slate-400">Day {item.day}</p>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">{item.content}</p>
                <p
                  className={`mt-2 inline-flex items-center gap-1 text-xs ${
                    item.intuitionPass ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  <BrainCircuit size={13} />
                  💡 你的直觉分析：{item.intuition || '这条消息雾里看花，先保持谨慎。'}
                </p>
              </article>
            ))}
          </div>
        )}

        <p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-400">
          <MessageSquareMore size={13} />
          消息含有大量真假混杂的职场情报，请谨慎判断。
        </p>
      </div>
    </div>
  )
}

export default PhoneDrawer

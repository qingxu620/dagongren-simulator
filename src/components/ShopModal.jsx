import { useEffect } from 'react'
import { CircleX, Coins, Sparkles } from 'lucide-react'

function ShopModal({
  isOpen,
  onClose,
  items,
  money,
  onBuy,
  onHospitalize,
  hospitalCost = 1000,
  hospitalTurnsRemaining = 0,
  errorMessage,
  isInteractionLocked,
}) {
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

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-sky-600">Shop</p>
            <h3 className="text-xl font-bold text-slate-900">楼下便利店</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <CircleX size={18} />
          </button>
        </header>

        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <Coins size={14} />
            当前资金: ${Number(money).toFixed(2)}
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{item.name}</h4>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-sky-600">
                    <Sparkles size={13} />
                    {item.effectText}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onBuy(item)}
                  disabled={isInteractionLocked}
                  className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 transition hover:border-sky-300 hover:bg-sky-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  购买 ${item.cost}
                </button>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <h4 className="text-sm font-semibold text-rose-700">🏥 申请住院治疗</h4>
          <p className="mt-1 text-xs leading-relaxed text-rose-600">
            花费 ${hospitalCost}，跳过接下来的 3 回合，不触发事件并强制清空负面状态，精力和精神恢复至满值。
          </p>
          <button
            type="button"
            onClick={onHospitalize}
            disabled={isInteractionLocked || hospitalTurnsRemaining > 0}
            className="mt-3 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {hospitalTurnsRemaining > 0 ? `住院进行中（剩余 ${hospitalTurnsRemaining} 回合）` : `申请住院 - $${hospitalCost}`}
          </button>
        </section>

        {errorMessage ? <p className="mt-4 text-sm font-medium text-rose-400">{errorMessage}</p> : null}
      </div>
    </div>
  )
}

export default ShopModal

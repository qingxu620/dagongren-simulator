import { useEffect } from 'react'
import { CircleX, PackageOpen, Wrench } from 'lucide-react'

function BackpackModal({ isOpen, onClose, items, onSellItem, getResalePrice, errorMessage, isInteractionLocked }) {
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
            <p className="text-xs uppercase tracking-[0.15em] text-violet-600">Inventory</p>
            <h3 className="text-xl font-bold text-slate-900">我的工位（背包）</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <CircleX size={18} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            <PackageOpen className="mx-auto mb-2 text-slate-400" size={20} />
            你的工位现在空空如也，还没有任何道具。
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const percent = Math.max(0, Math.min(100, (item.durability / item.maxDurability) * 100))
              const resale = getResalePrice(item)

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-200"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h4 className="text-base font-semibold text-slate-900">{item.name}</h4>
                      <p className="text-sm text-indigo-700">{item.effect}</p>
                      <p className="text-sm text-amber-700">隐藏小坑：{item.hiddenFlaw}</p>
                      <div className="mt-2">
                        <p className="mb-1 text-xs text-slate-500">
                          耐久度：{item.durability}/{item.maxDurability}
                        </p>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-violet-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSellItem(item.id)}
                      disabled={isInteractionLocked}
                      className="inline-flex items-center gap-1 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <Wrench size={14} />
                      二手卖出 ${resale}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {errorMessage ? <p className="mt-4 text-sm font-medium text-rose-500">{errorMessage}</p> : null}
      </div>
    </div>
  )
}

export default BackpackModal

import { AlertTriangle, Sparkles } from 'lucide-react'
import { ModalBody, ModalCloseButton, ModalFooter, ModalHeader, ModalShell } from './ModalShell'

function MysterySellerModal({
  isOpen,
  onClose,
  items,
  onBuy,
  availableMoney,
  errorMessage,
  isInteractionLocked,
}) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} panelClassName="sm:max-w-3xl">
      <ModalHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-fuchsia-600">Random Event</p>
            <h3 className="text-xl font-bold text-slate-900">神秘推销商</h3>
            <p className="mt-1 text-sm text-slate-500">他神出鬼没，只在你最忙的时候出现。</p>
          </div>
          <ModalCloseButton onClick={onClose} label="关闭神秘推销商" />
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          当前可用资金: <span className="font-semibold text-emerald-600">${Number(availableMoney).toFixed(2)}</span>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const canBuy = !isInteractionLocked && availableMoney >= item.price

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-fuchsia-200"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-slate-900">{item.name}</h4>
                    <p className="inline-flex items-center gap-1 text-sm text-indigo-700">
                      <Sparkles size={14} />
                      {item.effect}
                    </p>
                    <p className="inline-flex items-center gap-1 text-sm text-amber-700">
                      <AlertTriangle size={14} />
                      隐藏小坑：{item.hiddenFlaw}
                    </p>
                    <p className="text-xs text-slate-500">
                      耐久度：{item.durability}/{item.maxDurability}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onBuy(item.id)}
                    disabled={!canBuy}
                    className="w-full rounded-xl border border-fuchsia-200 bg-fuchsia-50 px-3 py-2 text-sm font-medium text-fuchsia-700 transition hover:border-fuchsia-300 hover:bg-fuchsia-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 md:w-auto"
                  >
                    购买 ${item.price}
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        {errorMessage ? <p className="text-sm font-medium text-rose-500">{errorMessage}</p> : null}
      </ModalBody>

      <ModalFooter className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 sm:w-auto"
        >
          关闭
        </button>
      </ModalFooter>
    </ModalShell>
  )
}

export default MysterySellerModal

import { useEffect } from 'react'
import { CircleX, HandCoins, Landmark } from 'lucide-react'

function formatPrice(value) {
  return Number(value).toFixed(2)
}

function InvestmentModal({
  isOpen,
  onClose,
  availableMoney,
  marketPrices,
  holdings,
  assets,
  onBuyOne,
  onSellAll,
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
            <p className="text-xs uppercase tracking-[0.15em] text-emerald-600">Market</p>
            <h3 className="text-xl font-bold text-slate-900">摸鱼炒股</h3>
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
            <Landmark size={14} />
            可用资金: ${formatPrice(availableMoney)}
          </span>
        </div>

        <div className="space-y-3">
          {assets.map((asset) => {
            const unitPrice = marketPrices[asset.key]
            const amount = holdings[asset.key]
            const canBuy = !isInteractionLocked && availableMoney >= unitPrice
            const canSell = !isInteractionLocked && amount > 0

            return (
              <article
                key={asset.key}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">{asset.name}</h4>
                    <p className="mt-1 text-sm text-slate-500">{asset.riskLabel}</p>
                    <p className="mt-2 text-sm text-slate-700">
                      当前单价: <span className="font-semibold">${formatPrice(unitPrice)}</span>
                    </p>
                    <p className="text-sm text-slate-700">
                      持有数量: <span className="font-semibold">{amount}</span> 股
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onBuyOne(asset.key)}
                      disabled={!canBuy}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      买入1股
                    </button>
                    <button
                      type="button"
                      onClick={() => onSellAll(asset.key)}
                      disabled={!canSell}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <HandCoins size={14} />
                      全部卖出
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {errorMessage ? <p className="mt-4 text-sm font-medium text-rose-500">{errorMessage}</p> : null}
      </div>
    </div>
  )
}

export default InvestmentModal

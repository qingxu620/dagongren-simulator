import { HandCoins, Landmark } from 'lucide-react'
import { ModalBody, ModalCloseButton, ModalFooter, ModalHeader, ModalShell } from './ModalShell'

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
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} panelClassName="sm:max-w-2xl">
      <ModalHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-emerald-600">Market</p>
            <h3 className="text-xl font-bold text-slate-900">摸鱼炒股</h3>
          </div>
          <ModalCloseButton onClick={onClose} label="关闭市场" />
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
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
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

                  <div className="flex w-full flex-col gap-2 md:w-auto">
                    <button
                      type="button"
                      onClick={() => onBuyOne(asset.key)}
                      disabled={!canBuy}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      买入 1 股
                    </button>
                    <button
                      type="button"
                      onClick={() => onSellAll(asset.key)}
                      disabled={!canSell}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
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

export default InvestmentModal

import { Coins, Lock, Sparkles, WandSparkles, X } from 'lucide-react'

const soulShopItems = [
  {
    id: 'starterCashBoost',
    title: '开局资金 +$2000',
    cost: 500,
    description: '每一局开局直接多一笔启动资金，减少前期窒息感。',
    icon: Coins,
  },
  {
    id: 'lockGoldenTalent',
    title: '锁定一个金色天赋',
    cost: 1000,
    description: '开局固定获得金色天赋，额外提高智慧上限起点。',
    icon: Sparkles,
  },
]

function SoulShopModal({ isOpen, onClose, soulPoints = 0, upgrades = {}, onPurchase, onCheatAddSoul }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          aria-label="关闭灵魂商店"
        >
          <X size={16} />
        </button>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-500">Meta Progression</p>
            <h3 className="text-2xl font-extrabold text-slate-900">灵魂商店</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
            <WandSparkles size={14} />
            打工魂 {Math.floor(soulPoints)}
          </div>
        </div>

        <div className="space-y-3">
          {soulShopItems.map((item) => {
            const Icon = item.icon
            const owned = Boolean(upgrades[item.id])
            const notEnough = soulPoints < item.cost

            return (
              <section
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="inline-flex items-center gap-1 text-base font-semibold text-slate-800">
                      <Icon size={16} className="text-amber-500" />
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                    <p className="mt-2 text-xs text-slate-500">消耗：{item.cost} 打工魂</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPurchase?.(item.id)}
                    disabled={owned || notEnough}
                    className="inline-flex h-11 min-w-24 items-center justify-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {owned ? (
                      <>
                        <Lock size={14} />
                        已拥有
                      </>
                    ) : (
                      '购买'
                    )}
                  </button>
                </div>
              </section>
            )
          })}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">局外永久增益会自动保存到本地浏览器。</p>
          <button
            type="button"
            onClick={onCheatAddSoul}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-400 transition hover:border-amber-300 hover:text-amber-600"
          >
            dev: +1000 魂
          </button>
        </div>
      </div>
    </div>
  )
}

export default SoulShopModal


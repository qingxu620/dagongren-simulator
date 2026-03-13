import { Coins, Lock, Sparkles, WandSparkles } from 'lucide-react'
import { ModalBody, ModalCloseButton, ModalFooter, ModalHeader, ModalShell } from './ModalShell'

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
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} zIndexClass="z-[70]" panelClassName="sm:max-w-2xl">
      <ModalHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-500">Meta Progression</p>
            <h3 className="text-2xl font-extrabold text-slate-900">灵魂商店</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
              <WandSparkles size={14} />
              打工魂 {Math.floor(soulPoints)}
            </div>
            <ModalCloseButton onClick={onClose} label="关闭灵魂商店" />
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-3">
          {soulShopItems.map((item) => {
            const Icon = item.icon
            const owned = Boolean(upgrades[item.id])
            const notEnough = soulPoints < item.cost

            return (
              <section key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
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
                    className="inline-flex h-11 w-full items-center justify-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 md:w-auto md:min-w-24"
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
      </ModalBody>

      <ModalFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">局外永久增益会自动保存到本地浏览器。</p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={onCheatAddSoul}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-400 transition hover:border-amber-300 hover:text-amber-600"
          >
            dev: +1000 魂
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
          >
            关闭
          </button>
        </div>
      </ModalFooter>
    </ModalShell>
  )
}

export default SoulShopModal

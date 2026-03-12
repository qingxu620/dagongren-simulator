import { Coins, Skull, Trophy } from 'lucide-react'

function EndgameSummaryModal({
  isOpen,
  isVictory,
  title = '',
  description = '',
  survivedDays = 0,
  finalMoney = 0,
  soulEarned = 0,
  soulTotal = 0,
  unlockedTitles = [],
  onAcknowledge,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/65 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <p
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
            isVictory ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}
        >
          {isVictory ? <Trophy size={14} /> : <Skull size={14} />}
          {isVictory ? 'Victory Settlement' : 'Game Over Settlement'}
        </p>

        <h3 className="mt-3 text-2xl font-extrabold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">存活天数</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{survivedDays} 天</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">最终资金</p>
            <p className="mt-1 text-lg font-bold text-slate-900">${Number(finalMoney).toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <p className="inline-flex items-center gap-1 text-xs text-amber-600">
              <Coins size={12} />
              本局打工魂
            </p>
            <p className="mt-1 text-lg font-bold text-amber-700">+{soulEarned}</p>
          </div>
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-700">当前打工魂总计：{soulTotal}</p>

        {unlockedTitles.length ? (
          <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-3">
            <p className="text-sm font-semibold text-indigo-700">新解锁成就</p>
            <p className="mt-1 text-sm text-slate-700">{unlockedTitles.join('、')}</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onAcknowledge}
          className="mt-6 h-12 w-full rounded-2xl bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-400"
        >
          我知道了
        </button>
      </div>
    </div>
  )
}

export default EndgameSummaryModal


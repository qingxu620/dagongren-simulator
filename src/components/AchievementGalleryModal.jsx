import { Trophy, X } from 'lucide-react'

function AchievementGalleryModal({ isOpen, onClose, achievements = [], unlockedIds = [] }) {
  if (!isOpen) {
    return null
  }

  const unlockedSet = new Set(unlockedIds)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-3xl border border-indigo-200 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          aria-label="关闭图鉴"
        >
          <X size={16} />
        </button>

        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.18em] text-indigo-500">Collection</p>
          <h3 className="text-2xl font-extrabold text-slate-900">🏆 墓志铭与成就</h3>
          <p className="mt-1 text-sm text-slate-500">解锁你的打工终局姿势。未解锁条目会保持神秘。</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((item) => {
            const unlocked = unlockedSet.has(item.id)
            return (
              <article
                key={item.id}
                className={`rounded-2xl border p-4 shadow-sm transition ${
                  unlocked
                    ? 'border-indigo-200 bg-indigo-50'
                    : 'border-slate-200 bg-slate-100 opacity-70 grayscale'
                }`}
              >
                <p className={`inline-flex items-center gap-1 text-sm font-semibold ${unlocked ? 'text-indigo-700' : 'text-slate-500'}`}>
                  <Trophy size={14} />
                  {unlocked ? item.title : '???'}
                </p>
                <p className={`mt-2 text-sm ${unlocked ? 'text-slate-700' : 'text-slate-500'}`}>
                  {unlocked ? item.condition : '成就条件尚未公开。'}
                </p>
                <p className={`mt-2 text-xs ${unlocked ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {unlocked ? item.comment : '等你亲自写下墓志铭。'}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AchievementGalleryModal


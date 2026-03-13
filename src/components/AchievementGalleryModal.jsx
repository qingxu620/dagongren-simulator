import { Trophy } from 'lucide-react'
import { ModalBody, ModalCloseButton, ModalFooter, ModalHeader, ModalShell } from './ModalShell'

function AchievementGalleryModal({ isOpen, onClose, achievements = [], unlockedIds = [] }) {
  const unlockedSet = new Set(unlockedIds)

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} zIndexClass="z-[70]" panelClassName="sm:max-w-3xl">
      <ModalHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-500">Collection</p>
            <h3 className="text-2xl font-extrabold text-slate-900">墓志铭与成就</h3>
            <p className="mt-1 text-sm text-slate-500">解锁你的打工终局姿势。未解锁条目会保持神秘。</p>
          </div>
          <ModalCloseButton onClick={onClose} label="关闭成就图鉴" />
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="grid gap-3 md:grid-cols-2">
          {achievements.map((item) => {
            const unlocked = unlockedSet.has(item.id)
            return (
              <article
                key={item.id}
                className={`rounded-2xl border p-4 shadow-sm transition ${
                  unlocked ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-100 opacity-70 grayscale'
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
      </ModalBody>

      <ModalFooter className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 sm:w-auto"
        >
          关闭图鉴
        </button>
      </ModalFooter>
    </ModalShell>
  )
}

export default AchievementGalleryModal

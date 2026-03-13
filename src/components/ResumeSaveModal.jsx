import { BriefcaseBusiness, RotateCcw } from 'lucide-react'
import { ModalBody, ModalFooter, ModalHeader, ModalShell } from './ModalShell'

function ResumeSaveModal({ isOpen, savedDay = 1, onResume, onRestart }) {
  return (
    <ModalShell
      isOpen={isOpen}
      closeOnOverlay={false}
      closeOnEscape={false}
      zIndexClass="z-[95]"
      panelClassName="sm:max-w-lg"
    >
      <ModalHeader>
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-600">
            <BriefcaseBusiness size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-600">Resume Run</p>
            <h2 className="text-xl font-bold text-slate-900">检测到未完结的打工生涯</h2>
            <p className="mt-1 text-sm text-slate-500">上一次进度停留在 Day {savedDay}，请选择继续搬砖还是直接重新投胎。</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="text-sm text-slate-700">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-medium text-amber-800">继续搬砖会直接恢复到上次自动存档的状态。</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-700">
            重新投胎会丢弃本局进度，但不会影响灵魂点和成就图鉴。
          </p>
        </div>
      </ModalBody>

      <ModalFooter className="space-y-3">
        <button
          type="button"
          onClick={onResume}
          className="h-12 w-full rounded-2xl bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-400"
        >
          继续搬砖（读取存档）
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <RotateCcw size={16} />
          重新投胎（放弃当前进度）
        </button>
      </ModalFooter>
    </ModalShell>
  )
}

export default ResumeSaveModal

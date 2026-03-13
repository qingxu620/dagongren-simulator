import { KeyRound } from 'lucide-react'
import { ModalBody, ModalFooter, ModalHeader, ModalShell } from './ModalShell'

function ApiKeyGateModal({ isOpen, apiKeyInput, onApiKeyInputChange, onSaveApiKey, apiKeyStatus }) {
  const canSubmit = Boolean(apiKeyInput.trim())

  return (
    <ModalShell
      isOpen={isOpen}
      closeOnOverlay={false}
      closeOnEscape={false}
      zIndexClass="z-[90]"
      panelClassName="sm:max-w-md"
    >
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault()
          if (!canSubmit) {
            return
          }
          onSaveApiKey()
        }}
      >
        <ModalHeader>
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-600">
              <KeyRound size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sky-600">Required Setup</p>
              <h2 className="text-xl font-bold text-slate-900">先输入 DeepSeek API Key</h2>
              <p className="mt-1 text-sm text-slate-500">未保存 Key 前，游戏主界面不会开放交互。</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="text-sm text-slate-700">
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <p className="font-medium text-sky-800">把 `sk-...` 开头的 Key 粘贴进来。</p>
            <p className="mt-1 text-xs leading-relaxed text-sky-700">
              Key 只会保存在当前浏览器的 `localStorage`，用于向 DeepSeek 发起剧情请求。
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-800">DeepSeek API Key</span>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(event) => onApiKeyInputChange(event.target.value)}
              autoFocus
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none ring-sky-300/70 transition focus:ring-2"
              placeholder="输入 sk-... 开头的 Key"
            />
          </label>

          {apiKeyStatus ? <p className="text-xs text-sky-600">{apiKeyStatus}</p> : null}
        </ModalBody>

        <ModalFooter className="space-y-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-12 w-full rounded-2xl bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            保存并进入游戏
          </button>
          <p className="text-center text-xs text-slate-500">保存后会进入教程，然后才能开始当天剧情。</p>
        </ModalFooter>
      </form>
    </ModalShell>
  )
}

export default ApiKeyGateModal

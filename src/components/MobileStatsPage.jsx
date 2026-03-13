import { useEffect, useState } from 'react'
import {
  Activity,
  BatteryMedium,
  Brain,
  BriefcaseBusiness,
  HeartHandshake,
  KeyRound,
  Save,
  Users,
  Wallet,
} from 'lucide-react'

const statConfigs = [
  { key: 'money', label: '资金', icon: Wallet, color: 'bg-emerald-500', suffix: '' },
  { key: 'energy', label: '精力', icon: BatteryMedium, color: 'bg-amber-400', suffix: '/100' },
  { key: 'sanity', label: '精神', icon: Brain, color: 'bg-sky-400', suffix: '/100' },
  { key: 'bossFavor', label: '老板好感', icon: HeartHandshake, color: 'bg-rose-500', suffix: '/100' },
  { key: 'colleagueFavor', label: '同事关系', icon: Users, color: 'bg-violet-500', suffix: '/100' },
  { key: 'clientFavor', label: '甲方满意', icon: BriefcaseBusiness, color: 'bg-fuchsia-500', suffix: '/100' },
]

function formatStatValue(statKey, value) {
  if (statKey === 'money') {
    return Number(value ?? 0).toFixed(2)
  }
  return Math.trunc(Number(value ?? 0))
}

function MobileStatsPage({
  gameState,
  healthState,
  talents = [],
  hasApiKey,
  apiKeyInput,
  onApiKeyInputChange,
  onSaveApiKey,
  apiKeyStatus,
  isHallucinationMode = false,
}) {
  const [isApiEditorOpen, setIsApiEditorOpen] = useState(() => !hasApiKey)

  useEffect(() => {
    if (!hasApiKey) {
      setIsApiEditorOpen(true)
    }
  }, [hasApiKey])

  return (
    <div className="min-h-full bg-slate-50 px-4 py-4">
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-4 pb-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-2xl font-bold text-white shadow-md">
              打
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-600">Day {gameState.day}</p>
              <h1 className={`mt-1 text-xl font-bold ${isHallucinationMode ? 'text-violet-700' : 'text-slate-900'}`}>
                打工人模拟器
              </h1>
              <p className="mt-1 text-sm text-slate-500">移动端状态页，只保留关键数值和天赋信息。</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              智慧 {gameState.wisdom}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              帮派 {gameState.faction || '无党派牛马'}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                healthState?.sick ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              <Activity size={12} />
              {healthState?.sick ? `生病 ${healthState.sickDays} 天` : '未生病'}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                healthState?.depressed
                  ? 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              <Activity size={12} />
              {healthState?.depressed ? `抑郁 ${healthState.depressedDays} 天` : '心态稳定'}
            </span>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Stats</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">核心属性</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              实时变化
            </span>
          </div>

          <div className="grid gap-3">
            {statConfigs.map((item) => {
              const Icon = item.icon
              const value = Number(gameState[item.key] ?? 0)
              const percent = Math.max(0, Math.min(100, value))

              return (
                <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700">
                      <Icon size={16} className="shrink-0 text-sky-500" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatStatValue(item.key, value)}
                      <span className="ml-0.5 text-xs font-medium text-slate-400">{item.suffix}</span>
                    </div>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Talents</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">当前天赋</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {talents.length ? (
              talents.map((talent) => (
                <span
                  key={talent}
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                >
                  {talent}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                暂无天赋
              </span>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <KeyRound size={16} className="text-sky-500" />
              DeepSeek API Key
            </div>
            <button
              type="button"
              onClick={() => setIsApiEditorOpen((prev) => !prev)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-sky-300 hover:text-sky-600"
            >
              {isApiEditorOpen ? '收起' : '管理'}
            </button>
          </div>

          <p className={`mt-2 text-xs ${hasApiKey ? 'text-emerald-600' : 'text-slate-500'}`}>
            {hasApiKey ? '已连接，本地已保存 API Key。' : '当前未配置 API Key。'}
          </p>

          {isApiEditorOpen ? (
            <div className="mt-3 space-y-3">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(event) => onApiKeyInputChange(event.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none ring-sky-300/70 transition focus:ring-2"
                placeholder="输入 sk- 开头的 API Key"
              />
              <button
                type="button"
                onClick={onSaveApiKey}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                <Save size={15} />
                保存 API Key
              </button>
            </div>
          ) : null}

          {apiKeyStatus ? <p className="mt-2 text-xs text-sky-600">{apiKeyStatus}</p> : null}
        </section>
      </div>
    </div>
  )
}

export default MobileStatsPage

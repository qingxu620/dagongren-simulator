import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  BatteryMedium,
  Brain,
  BriefcaseBusiness,
  HeartHandshake,
  KeyRound,
  LineChart,
  Save,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react'

const statConfigs = [
  { key: 'money', label: '资金', icon: Wallet, color: 'bg-emerald-500', suffix: '' },
  { key: 'energy', label: '精力', icon: BatteryMedium, color: 'bg-amber-400', suffix: '/100' },
  { key: 'sanity', label: '精神状态', icon: Brain, color: 'bg-sky-400', suffix: '/100' },
  { key: 'bossFavor', label: '老板好感度', icon: HeartHandshake, color: 'bg-rose-500', suffix: '/100' },
  { key: 'colleagueFavor', label: '同事关系', icon: Users, color: 'bg-violet-500', suffix: '/100' },
  { key: 'clientFavor', label: '甲方满意度', icon: BriefcaseBusiness, color: 'bg-fuchsia-500', suffix: '/100' },
]

function formatFloatDelta(key, delta) {
  if (key === 'money') {
    const value = Number(delta).toFixed(2)
    return `${delta > 0 ? '+' : ''}${value}`
  }

  return `${delta > 0 ? '+' : ''}${Math.trunc(delta)}`
}

function SidebarStats({
  gameState,
  talents = [],
  onOpenShop,
  onOpenMarket,
  onOpenBackpack,
  isInteractionLocked,
  isVictory,
  healthState,
  apiKeyInput,
  onApiKeyInputChange,
  onSaveApiKey,
  hasApiKey,
  apiKeyStatus,
  isHallucinationMode = false,
  showSystemSection = true,
}) {
  const [floaters, setFloaters] = useState([])
  const prevStateRef = useRef(gameState)
  const mountedRef = useRef(false)
  const timerIdsRef = useRef([])

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      prevStateRef.current = gameState
      return
    }

    const nextFloaters = []

    statConfigs.forEach((item) => {
      const prevValue = Number(prevStateRef.current[item.key] ?? 0)
      const nextValue = Number(gameState[item.key] ?? 0)
      const delta = nextValue - prevValue

      if (Math.abs(delta) > 0.001) {
        nextFloaters.push({
          id: `${item.key}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          key: item.key,
          delta,
        })
      }
    })

    if (nextFloaters.length) {
      const appendTimerId = window.setTimeout(() => {
        setFloaters((prev) => [...prev, ...nextFloaters])
        nextFloaters.forEach((floater) => {
          const timerId = window.setTimeout(() => {
            setFloaters((prev) => prev.filter((item) => item.id !== floater.id))
          }, 900)
          timerIdsRef.current.push(timerId)
        })
      }, 0)
      timerIdsRef.current.push(appendTimerId)
    }

    prevStateRef.current = gameState
  }, [gameState])

  useEffect(() => {
    return () => {
      timerIdsRef.current.forEach((id) => window.clearTimeout(id))
      timerIdsRef.current = []
    }
  }, [])

  return (
    <aside className="flex min-h-0 w-full flex-col gap-4 p-4 md:h-full md:gap-5 md:p-5">
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:p-5">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-2xl font-bold text-white shadow-md md:h-20 md:w-20 md:text-4xl">
            打
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.22em] text-sky-600">Day {gameState.day}</p>
            <h1 className={`mt-1 text-lg font-bold md:text-[2rem] ${isHallucinationMode ? 'text-violet-700' : 'text-slate-900'}`}>
              {isHallucinationMode ? '打工人模拟器 · 幻觉模式' : '打工人模拟器'}
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm md:max-w-xs md:text-base">
              你的职场生存值正在实时变化
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                <Sparkles size={12} />
                智慧 {gameState.wisdom}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                帮派：{gameState.faction || '无党派牛马'}
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

            <div className="mt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Talents</p>
              <div className="flex flex-wrap gap-2">
                {talents.length ? (
                  talents.map((talent) => (
                    <span
                      key={talent}
                      className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                    >
                      {talent}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                    暂无天赋
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-4">
        {statConfigs.map((item) => {
          const Icon = item.icon
          const value = Number(gameState[item.key] ?? 0)
          const displayValue = item.key === 'money' ? value.toFixed(2) : Math.trunc(value)
          const percent = Math.max(0, Math.min(100, value))
          const localFloaters = floaters.filter((floater) => floater.key === item.key)

          return (
            <div key={item.key} className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
              <div className="mb-2 flex items-start justify-between gap-3 md:mb-3">
                <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700 md:text-base">
                  <Icon size={16} className="shrink-0 text-sky-500 md:h-[18px] md:w-[18px]" />
                  <span className="whitespace-normal break-words">{item.label}</span>
                </div>

                <div className="relative shrink-0 text-sm font-semibold text-slate-900 md:text-base">
                  <span>
                    {displayValue}
                    <span className="ml-0.5 text-slate-500">{item.suffix}</span>
                  </span>
                  <div className="pointer-events-none absolute -right-1 -top-5 space-y-1">
                    {localFloaters.map((floater) => (
                      <div
                        key={floater.id}
                        className={`animate-float-up rounded-md px-1.5 py-0.5 text-[11px] font-semibold shadow-sm ${
                          floater.delta > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {formatFloatDelta(item.key, floater.delta)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 md:h-3">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          )
        })}
      </section>

      {showSystemSection ? (
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-row gap-2 overflow-x-auto md:flex-col md:gap-3 md:overflow-visible">
            <button
              type="button"
              onClick={onOpenShop}
              disabled={isInteractionLocked}
              className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 md:h-14 md:justify-start"
            >
              <ShoppingCart size={16} />
              <span>便利店</span>
            </button>
            <button
              type="button"
              onClick={onOpenMarket}
              disabled={isInteractionLocked}
              className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 md:h-14 md:justify-start"
            >
              <LineChart size={16} />
              <span>摸鱼炒股</span>
            </button>
            <button
              type="button"
              onClick={onOpenBackpack}
              disabled={isInteractionLocked}
              className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 md:h-14 md:justify-start"
            >
              <ShoppingBag size={16} />
              <span>我的背包</span>
            </button>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            商店、股市和背包入口都在这里。{isVictory ? ' 通关后交易功能会关闭。' : ''}
          </p>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 md:text-base">
          <KeyRound size={16} className="text-sky-500" />
          DeepSeek API Key
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(event) => onApiKeyInputChange(event.target.value)}
            className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none ring-sky-300/70 transition focus:ring-2"
            placeholder="输入 sk-... 开头的 Key"
          />
          <button
            type="button"
            onClick={onSaveApiKey}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-400 md:w-auto md:min-w-28"
          >
            <Save size={14} />
            保存
          </button>
        </div>

        <p className={`mt-3 text-sm ${hasApiKey ? 'text-emerald-600' : 'text-slate-500'}`}>
          {hasApiKey ? '已保存到当前浏览器 localStorage。' : '尚未保存 API Key。'}
        </p>
        {apiKeyStatus ? <p className="mt-1 text-sm text-sky-600">{apiKeyStatus}</p> : null}
      </section>
    </aside>
  )
}

export default SidebarStats

import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  BatteryMedium,
  Brain,
  BriefcaseBusiness,
  ChevronRight,
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
import { ModalBody, ModalCloseButton, ModalFooter, ModalHeader, ModalShell } from './ModalShell'

const statConfigs = [
  { key: 'money', label: '资金', icon: Wallet, color: 'bg-emerald-500', suffix: '' },
  { key: 'energy', label: '精力', icon: BatteryMedium, color: 'bg-amber-400', suffix: '/ 100' },
  { key: 'sanity', label: '精神状态', icon: Brain, color: 'bg-sky-400', suffix: '/ 100' },
  { key: 'bossFavor', label: '老板好感', icon: HeartHandshake, color: 'bg-rose-500', suffix: '/ 100' },
  { key: 'colleagueFavor', label: '同事关系', icon: Users, color: 'bg-violet-500', suffix: '/ 100' },
  { key: 'clientFavor', label: '甲方满意', icon: BriefcaseBusiness, color: 'bg-fuchsia-500', suffix: '/ 100' },
]

const compactStatKeys = ['money', 'energy', 'sanity', 'bossFavor']

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
}) {
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false)
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

  const handleOpenShop = () => {
    setIsMobileDetailsOpen(false)
    onOpenShop()
  }

  const handleOpenMarket = () => {
    setIsMobileDetailsOpen(false)
    onOpenMarket()
  }

  const handleOpenBackpack = () => {
    setIsMobileDetailsOpen(false)
    onOpenBackpack()
  }

  const detailedSections = (
    <>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {statConfigs.map((item) => {
          const Icon = item.icon
          const value = Number(gameState[item.key] ?? 0)
          const displayValue = item.key === 'money' ? value.toFixed(2) : Math.trunc(value)
          const percent = Math.max(0, Math.min(100, value))
          const localFloaters = floaters.filter((floater) => floater.key === item.key)

          return (
            <section key={item.key} className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon size={16} className="text-sky-500" />
                  <span>{item.label}</span>
                </div>
                <div className="relative text-sm font-semibold text-slate-800">
                  <span>
                    {displayValue}
                    <span className="text-slate-500">{item.suffix}</span>
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
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
              </div>
            </section>
          )
        })}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleOpenShop}
            disabled={isInteractionLocked}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <ShoppingCart size={16} />
            便利店
          </button>
          <button
            type="button"
            onClick={handleOpenMarket}
            disabled={isInteractionLocked}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <LineChart size={16} />
            摸鱼炒股
          </button>
          <button
            type="button"
            onClick={handleOpenBackpack}
            disabled={isInteractionLocked}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <ShoppingBag size={16} />
            我的工位
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          商店、股市和背包的详细操作都在这里。{isVictory ? ' 已通关后交易功能会关闭。' : ''}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <KeyRound size={16} className="text-sky-500" />
          DeepSeek API Key
        </div>
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(event) => onApiKeyInputChange(event.target.value)}
            className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-sky-300/70 transition focus:ring-2"
            placeholder="输入 sk-... 开头的 Key"
          />
          <button
            type="button"
            onClick={onSaveApiKey}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-sky-500 px-3 text-sm font-medium text-white transition hover:bg-sky-400"
          >
            <Save size={14} />
            保存
          </button>
        </div>
        <p className={`mt-2 text-xs ${hasApiKey ? 'text-emerald-600' : 'text-slate-500'}`}>
          {hasApiKey ? '已保存到当前浏览器 localStorage。' : '尚未保存 API Key。'}
        </p>
        {apiKeyStatus ? <p className="mt-1 text-xs text-sky-600">{apiKeyStatus}</p> : null}
      </section>
    </>
  )

  return (
    <>
      <aside className="min-h-0 w-full flex flex-col p-3 md:h-full md:p-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm sm:p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-lg font-bold text-white shadow-md sm:h-14 sm:w-14 sm:text-xl">
              打
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-sky-600">Day {gameState.day}</p>
              <h1 className={`text-base font-bold sm:text-xl ${isHallucinationMode ? 'text-violet-700' : 'text-slate-900'}`}>
                {isHallucinationMode ? '打工人模拟器·幻觉模式' : '打工人模拟器'}
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">你的职场生存值正在实时变化</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700 sm:text-xs">
                  <Sparkles size={12} />
                  智慧 {gameState.wisdom}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 sm:text-xs">
                  帮派：{gameState.faction || '无党派牛马'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] sm:text-xs ${
                    healthState?.sick ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Activity size={12} />
                  {healthState?.sick ? `生病 ${healthState.sickDays} 天` : '未生病'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] sm:text-xs ${
                    healthState?.depressed
                      ? 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Activity size={12} />
                  {healthState?.depressed ? `抑郁 ${healthState.depressedDays} 天` : '心态稳定'}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-slate-500">天赋：{talents.length ? talents.join('、') : '暂无'}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
          {compactStatKeys.map((key) => {
            const config = statConfigs.find((item) => item.key === key)
            const value = Number(gameState[key] ?? 0)
            const percent = Math.max(0, Math.min(100, value))
            const Icon = config?.icon || Wallet

            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-2.5">
                <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1 truncate">
                    <Icon size={12} className="text-sky-500" />
                    {config?.label}
                  </span>
                  <span className="font-semibold text-slate-800">{key === 'money' ? value.toFixed(2) : Math.trunc(value)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full ${config?.color}`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileDetailsOpen(true)}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 md:hidden"
        >
          查看详细面板
          <ChevronRight size={16} />
        </button>

        <div className="hidden space-y-6 pt-4 md:block">{detailedSections}</div>
      </aside>

      <ModalShell isOpen={isMobileDetailsOpen} onClose={() => setIsMobileDetailsOpen(false)} panelClassName="md:hidden sm:max-w-lg">
        <ModalHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sky-600">Status Panel</p>
              <h3 className="text-lg font-bold text-slate-900">详细面板</h3>
              <p className="mt-1 text-sm text-slate-500">这里集中放状态详情、商店入口和 API 管理。</p>
            </div>
            <ModalCloseButton onClick={() => setIsMobileDetailsOpen(false)} label="关闭详细面板" />
          </div>
        </ModalHeader>

        <ModalBody>{detailedSections}</ModalBody>

        <ModalFooter className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsMobileDetailsOpen(false)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 sm:w-auto"
          >
            关闭
          </button>
        </ModalFooter>
      </ModalShell>
    </>
  )
}

export default SidebarStats

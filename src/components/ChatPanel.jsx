import { useEffect, useRef } from 'react'
import { Smartphone } from 'lucide-react'

const changeLabels = [
  ['moneyChange', '资金'],
  ['energyChange', '精力'],
  ['sanityChange', '精神'],
  ['bossFavorChange', '老板'],
  ['colleagueFavorChange', '同事'],
  ['clientFavorChange', '甲方'],
]

function formatChange(value) {
  const numeric = Number(value ?? 0)
  if (numeric > 0) {
    return `+${numeric}`
  }
  return `${numeric}`
}

function getChangeClass(value) {
  const numeric = Number(value ?? 0)
  if (numeric > 0) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (numeric < 0) {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-slate-200 bg-slate-100 text-slate-500'
}

const timelineLabels = ['上午', '下午', '傍晚']

function getCurrentTimelineIndex(eventsToday, maxEventsToday, isAwaitingEndDay) {
  const total = Math.max(1, maxEventsToday)
  const currentEvent = isAwaitingEndDay ? total : Math.max(1, Math.min(total, eventsToday + 1))
  const progress = currentEvent / total

  if (progress <= 0.34) {
    return 0
  }
  if (progress <= 0.67) {
    return 1
  }
  return 2
}

function ChatPanel({
  messages,
  isLoading,
  isGameOver,
  isVictory,
  day = 1,
  eventsToday = 0,
  maxEventsToday = 0,
  isAwaitingEndDay = false,
  onOpenPhone,
  unreadPhoneCount = 0,
  loadingText = '命运的齿轮卡住了...',
}) {
  const scrollContainerRef = useRef(null)
  const safeMaxEvents = Math.max(1, maxEventsToday)
  const safeEventsToday = Math.max(0, Math.min(eventsToday, safeMaxEvents))
  const currentTimelineIndex = getCurrentTimelineIndex(safeEventsToday, safeMaxEvents, isAwaitingEndDay)
  const currentTimelineLabel = timelineLabels[currentTimelineIndex]
  const progressPercent = isAwaitingEndDay ? 100 : (safeEventsToday / safeMaxEvents) * 100

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const container = scrollContainerRef.current
      if (!container) {
        return
      }

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      })
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [messages, isLoading])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-3 py-2.5 sm:px-4 sm:py-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">剧情对话流</p>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">公司生存频道</h2>
          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Day {day}</span>
              <span>时段：{currentTimelineLabel}</span>
              <span>
                进度 {safeEventsToday}/{safeMaxEvents}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px]">
              {timelineLabels.map((label, index) => {
                const isDone = index < currentTimelineIndex || (isAwaitingEndDay && index === currentTimelineIndex)
                const isCurrent = index === currentTimelineIndex && !isAwaitingEndDay
                return (
                  <span
                    key={label}
                    className={`rounded-full px-2 py-1 font-medium ${
                      isDone
                        ? 'bg-indigo-100 text-indigo-700'
                        : isCurrent
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:justify-start">
          <button
            type="button"
            onClick={onOpenPhone}
            className="relative inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 sm:h-9"
          >
            <Smartphone size={14} />
            📱 手机
            {unreadPhoneCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {unreadPhoneCount > 99 ? '99+' : unreadPhoneCount}
              </span>
            ) : null}
          </button>
          <span
            className={`rounded-full px-3 py-1 text-xs ${
              isVictory
                ? 'border border-emerald-300 bg-emerald-50 text-emerald-700'
                : isGameOver
                  ? 'border border-rose-300 bg-rose-50 text-rose-700'
                  : 'border border-sky-200 bg-sky-50 text-sky-700'
            }`}
          >
            {isVictory ? 'Victory' : isGameOver ? 'Game Over' : 'AI 回合系统运行中'}
          </span>
        </div>
      </header>

      <section
        ref={scrollContainerRef}
        className="chat-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-2 touch-pan-y"
      >
        {messages.map((message) => {
          const isPlayer = message.role === 'player'

          return (
            <article key={message.id} className={`mb-3 flex ${isPlayer ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isPlayer
                    ? 'rounded-br-sm bg-sky-500 text-white'
                    : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                }`}
              >
                <p className={`mb-1 text-xs ${isPlayer ? 'text-sky-100' : 'text-slate-500'}`}>
                  {isPlayer ? '你' : '系统'}
                </p>
                <p>{message.content}</p>

                {!isPlayer && message.changes ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {changeLabels.map(([key, label]) => (
                      <span
                        key={key}
                        className={`rounded-full border px-2 py-0.5 text-xs ${getChangeClass(message.changes[key])}`}
                      >
                        {label} {formatChange(message.changes[key])}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          )
        })}

        {isLoading ? (
          <article className="flex justify-start">
            <div className="max-w-xl rounded-2xl rounded-bl-sm border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
              <p className="mb-1 text-xs text-slate-500">系统</p>
              <p className="mb-2 animate-pulse">💬 {loadingText}</p>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-sky-400" />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-sky-500"
                  style={{ animationDelay: '120ms' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-sky-600"
                  style={{ animationDelay: '240ms' }}
                />
              </div>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  )
}

export default ChatPanel

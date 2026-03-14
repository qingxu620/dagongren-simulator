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

const timelineLabels = ['上午', '下午', '傍晚']

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
  currentDailyTheme = null,
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
  const currentThemeName = currentDailyTheme?.name || '办公室空气平静得可疑'
  const currentThemeDescription =
    currentDailyTheme?.description || '今天暂时没有明确风向，危险与机会都藏在细节里。'

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
      <header className="relative shrink-0 border-b border-slate-200 px-3 py-2 md:flex md:flex-row md:items-center md:justify-between md:px-6 md:py-3">
        <div className="min-w-0 pr-12 md:flex md:min-w-0 md:flex-row md:items-center md:gap-4 md:pr-0">
          <div className="md:hidden">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
              <span className="font-semibold text-slate-800">Day {day}</span>
              <span className="text-slate-300">•</span>
              <span>{currentTimelineLabel}</span>
              <span className="text-slate-300">•</span>
              <span>
                {safeEventsToday}/{safeMaxEvents}
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <p className="pr-2 text-[11px] font-medium text-sky-700">{`🎭 主题：${currentThemeName}`}</p>
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <h2 className="whitespace-nowrap text-base font-bold text-slate-900">💬 公司生存频道</h2>
            <div className="w-full min-w-0 md:w-64">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Day {day}</span>
                <span>{currentTimelineLabel}</span>
                <span>
                  {safeEventsToday}/{safeMaxEvents}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-3 top-2 flex items-center gap-2 md:static md:flex md:flex-row md:items-center md:gap-4">
          <div
            className="hidden min-w-0 md:block"
            title={currentThemeDescription}
          >
            <p className="text-sm font-semibold text-sky-700">{`🎭 今日主题：${currentThemeName}`}</p>
            <p className="max-w-xs truncate text-xs text-slate-400">{currentThemeDescription}</p>
          </div>
          <span
            className={`hidden rounded-full px-3 py-1 text-xs md:inline-flex ${
              isVictory
                ? 'border border-emerald-300 bg-emerald-50 text-emerald-700'
                : isGameOver
                  ? 'border border-rose-300 bg-rose-50 text-rose-700'
                  : 'border border-sky-200 bg-sky-50 text-sky-700'
            }`}
          >
            {isVictory ? 'Victory' : isGameOver ? 'Game Over' : 'AI 回合系统运行中'}
          </span>
          <button
            type="button"
            onClick={onOpenPhone}
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 md:h-9 md:w-auto md:gap-1 md:rounded-xl md:px-3 md:text-xs md:font-medium"
          >
            <Smartphone size={15} />
            <span className="hidden md:inline">手机</span>
            {unreadPhoneCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {unreadPhoneCount > 99 ? '99+' : unreadPhoneCount}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      <section
        ref={scrollContainerRef}
        className="chat-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-2 touch-pan-y md:p-4"
      >
        {messages.map((message) => {
          const isPlayer = message.role === 'player'

          return (
            <article key={message.id} className={`mb-2.5 flex md:mb-3 ${isPlayer ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xl rounded-2xl px-3 py-2.5 text-[13px] leading-snug shadow-sm md:px-4 md:py-3 md:text-sm md:leading-relaxed ${
                  isPlayer
                    ? 'rounded-br-sm bg-sky-500 text-white'
                    : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                }`}
              >
                <p className={`mb-1 text-[11px] md:text-xs ${isPlayer ? 'text-sky-100' : 'text-slate-500'}`}>
                  {isPlayer ? '你' : '系统'}
                </p>
                <p>{message.content}</p>

                {!isPlayer && message.changes ? (
                  <div className="mt-2 flex flex-wrap gap-1.5 md:mt-3 md:gap-2">
                    {changeLabels.map(([key, label]) => (
                      <span
                        key={key}
                        className={`rounded-full border px-2 py-0.5 text-[11px] md:text-xs ${getChangeClass(message.changes[key])}`}
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
            <div className="max-w-xl rounded-2xl rounded-bl-sm border border-sky-200 bg-sky-50 px-3 py-2.5 text-[13px] text-slate-700 shadow-sm md:px-4 md:py-3 md:text-sm">
              <p className="mb-1 text-[11px] text-slate-500 md:text-xs">系统</p>
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

function InputBar({
  options,
  onSelectOption,
  onEndDay,
  onSideHustle,
  isLoading,
  isInteractionLocked,
  isGameOver,
  isVictory,
  hasApiKey,
  isAwaitingEndDay = false,
  endDayButtonText = '🌙 终于熬到头了，打卡下班！',
  sideHustlesToday = 0,
  sideHustleLimit = 2,
  eventsToday = 0,
  maxEventsToday = 0,
  isInvestmentInputMode = false,
  investmentAmount = 0,
  maxInvestment = 0,
  onInvestmentAmountChange,
  onConfirmInvestment,
  onRejectInvestment,
}) {
  const canSelectOption =
    !isInteractionLocked && hasApiKey && !isAwaitingEndDay && !isInvestmentInputMode && options.length > 0
  const canInvest = !isInteractionLocked && hasApiKey && maxInvestment > 0
  const canEndDay = !isInteractionLocked && hasApiKey && isAwaitingEndDay && !isInvestmentInputMode
  const canSideHustle =
    !isInteractionLocked &&
    hasApiKey &&
    !isAwaitingEndDay &&
    !isInvestmentInputMode &&
    sideHustlesToday < sideHustleLimit
  const safeInvestmentAmount = Math.max(0, Math.min(maxInvestment, Number(investmentAmount) || 0))
  const safeMaxEvents = Math.max(0, maxEventsToday)

  const helperText = !hasApiKey
    ? '请先在左侧输入并保存 DeepSeek API Key。'
    : isVictory
      ? '你已经通关，所有操作已禁用。'
      : isGameOver
        ? '游戏结束，选项已锁定。'
        : isInvestmentInputMode
          ? '这是一个需要输入金额的高风险事件，请谨慎操作。'
          : isAwaitingEndDay
            ? '今天的事件已处理完，点击按钮进行下班结算。'
            : options.length === 0 && !isLoading
              ? '等待 AI 生成本回合选项...'
              : null

  return (
    <footer className="input-bar-safe-area z-10 shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-700">{isInvestmentInputMode ? '投资决策区' : '本回合行动区'}</p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          今日事件 {Math.min(eventsToday, safeMaxEvents)}/{safeMaxEvents}
        </span>
      </div>

      {!isInvestmentInputMode ? (
        <div className="mb-3">
          <button
            type="button"
            onClick={onSideHustle}
            disabled={!canSideHustle}
            className="h-11 w-full rounded-full border border-emerald-300 bg-emerald-50 px-4 text-sm font-medium text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100 hover:shadow disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:h-12 sm:w-auto"
          >
            📦 疯狂接私活 ({sideHustlesToday}/{sideHustleLimit})
          </button>
        </div>
      ) : null}

      {isInvestmentInputMode ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-slate-700">输入你要打款的金额（上限：${maxInvestment.toFixed(2)}）</p>

          <div className="mt-3 space-y-3">
            <input
              type="range"
              min={0}
              max={Math.max(0, Math.floor(maxInvestment))}
              step={1}
              value={safeInvestmentAmount}
              onChange={(event) => onInvestmentAmountChange?.(Number(event.target.value))}
              disabled={!canInvest}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-amber-200"
            />

            <input
              type="number"
              min={0}
              max={Math.max(0, maxInvestment)}
              step={1}
              value={safeInvestmentAmount}
              onChange={(event) => onInvestmentAmountChange?.(Number(event.target.value))}
              disabled={!canInvest}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-amber-300/70 transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="输入投资金额"
            />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onConfirmInvestment?.(safeInvestmentAmount)}
              disabled={!canInvest}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              确认打款
            </button>
            <button
              type="button"
              onClick={onRejectInvestment}
              disabled={isInteractionLocked || !hasApiKey}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              滚蛋骗子
            </button>
          </div>
        </div>
      ) : isAwaitingEndDay ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onEndDay}
            disabled={!canEndDay}
            className="w-full max-w-xl rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-center text-sm font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-100 hover:shadow disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:px-6 sm:py-4"
          >
            {endDayButtonText}
          </button>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          {options.map((item, index) => (
            <button
              key={`${item}-${index}`}
              type="button"
              onClick={() => onSelectOption(item)}
              disabled={!canSelectOption}
              className="min-h-12 rounded-2xl border border-blue-200 bg-white px-3 py-3 text-left text-sm font-medium text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:shadow disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:px-4"
            >
              {`选项${String.fromCharCode(65 + index)}：${item}`}
            </button>
          ))}
        </div>
      )}

      {isLoading ? <p className="mt-3 text-sm text-blue-600">AI 正在生成下一轮剧情和选项...</p> : null}
      {helperText ? <p className="mt-2 text-xs text-slate-400">{helperText}</p> : null}
    </footer>
  )
}

export default InputBar

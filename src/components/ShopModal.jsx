import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Coins, Sparkles } from 'lucide-react'
import { ModalBody, ModalCloseButton, ModalFooter, ModalHeader, ModalShell } from './ModalShell'

let cachedAudioContext = null

function getAudioContext() {
  if (typeof window === 'undefined') {
    return null
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) {
    return null
  }

  if (!cachedAudioContext) {
    cachedAudioContext = new AudioContextClass()
  }

  return cachedAudioContext
}

async function playCoinSound() {
  try {
    const audioContext = getAudioContext()
    if (!audioContext) {
      return
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const now = audioContext.currentTime
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(1560, now)
    oscillator.frequency.exponentialRampToValueAtTime(2100, now + 0.08)
    oscillator.frequency.exponentialRampToValueAtTime(1760, now + 0.16)

    gainNode.gain.setValueAtTime(0.0001, now)
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start(now)
    oscillator.stop(now + 0.18)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  } catch {
    // Ignore audio failures silently; purchase feedback should not block gameplay.
  }
}

function formatMoneyText(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return '0'
  }
  return Number.isInteger(numeric) ? `${numeric}` : numeric.toFixed(2)
}

function ShopModal({
  isOpen,
  onClose,
  items,
  money,
  onBuy,
  onHospitalize,
  hospitalCost = 1000,
  hospitalTurnsRemaining = 0,
  errorMessage,
  isInteractionLocked,
}) {
  const [floatingTexts, setFloatingTexts] = useState([])
  const cleanupTimersRef = useRef([])

  useEffect(() => {
    return () => {
      cleanupTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      cleanupTimersRef.current = []
    }
  }, [])

  const handleBuyClick = (event, item) => {
    const result = onBuy(item)
    if (!result?.ok) {
      return
    }

    const floatingTextId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setFloatingTexts((prev) => [
      ...prev,
      {
        id: floatingTextId,
        x: event.clientX,
        y: event.clientY,
        text: `-$${formatMoneyText(item.cost)}`,
      },
    ])

    const timerId = window.setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((entry) => entry.id !== floatingTextId))
      cleanupTimersRef.current = cleanupTimersRef.current.filter((entry) => entry !== timerId)
    }, 800)

    cleanupTimersRef.current.push(timerId)
    void playCoinSound()
  }

  const floatingTextLayer =
    isOpen && typeof document !== 'undefined'
      ? createPortal(
          <div className="pointer-events-none fixed inset-0 z-[100]">
            {floatingTexts.map((entry) => (
              <span
                key={entry.id}
                className="animate-float-damage absolute -translate-x-1/2 -translate-y-1/2 text-lg font-black tracking-wide text-rose-500 drop-shadow-[0_2px_8px_rgba(255,255,255,0.95)]"
                style={{ left: `${entry.x}px`, top: `${entry.y}px` }}
              >
                {entry.text}
              </span>
            ))}
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <ModalShell isOpen={isOpen} onClose={onClose} panelClassName="sm:max-w-2xl">
        <ModalHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-sky-600">Shop</p>
              <h3 className="text-xl font-bold text-slate-900">楼下便利店</h3>
            </div>
            <ModalCloseButton onClick={onClose} label="关闭商店" />
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <Coins size={14} />
              当前资金: ${Number(money).toFixed(2)}
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <h4 className="text-base font-semibold text-slate-900">{item.name}</h4>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-sky-600">
                      <Sparkles size={13} />
                      {item.effectText}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => handleBuyClick(event, item)}
                    disabled={isInteractionLocked}
                    className="w-full rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 transition hover:border-sky-300 hover:bg-sky-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 md:w-auto"
                  >
                    购买 ${item.cost}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <h4 className="text-sm font-semibold text-rose-700">申请住院治疗</h4>
            <p className="mt-1 text-xs leading-relaxed text-rose-600">
              花费 ${hospitalCost}，跳过接下来 3 回合，不触发事件并清空负面状态，精力和精神恢复至满值。
            </p>
            <button
              type="button"
              onClick={onHospitalize}
              disabled={isInteractionLocked || hospitalTurnsRemaining > 0}
              className="mt-3 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 md:w-auto"
            >
              {hospitalTurnsRemaining > 0
                ? `住院进行中（剩余 ${hospitalTurnsRemaining} 回合）`
                : `申请住院 - $${hospitalCost}`}
            </button>
          </section>

          {errorMessage ? <p className="text-sm font-medium text-rose-500">{errorMessage}</p> : null}
        </ModalBody>

        <ModalFooter className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 sm:w-auto"
          >
            关闭
          </button>
        </ModalFooter>
      </ModalShell>

      {floatingTextLayer}
    </>
  )
}

export default ShopModal

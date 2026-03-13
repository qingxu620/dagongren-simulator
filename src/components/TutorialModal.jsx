import { BookOpenText, CircleCheckBig, Sparkles, TriangleAlert, Trophy, WandSparkles } from 'lucide-react'
import { ModalBody, ModalFooter, ModalHeader, ModalShell } from './ModalShell'

function TutorialModal({
  isOpen,
  onConfirm,
  soulPoints = 0,
  talentChoices = [],
  selectedTalentIds = [],
  selectedTalentCount = 0,
  requiredTalentCount = 3,
  onToggleTalent,
  lockGoldenTalent = false,
  onOpenSoulShop,
  onOpenAchievements,
  onCheatAddSoul,
}) {
  const isReadyToStart = selectedTalentCount === requiredTalentCount

  return (
    <ModalShell isOpen={isOpen} closeOnOverlay={false} closeOnEscape={false} panelClassName="sm:max-w-4xl">
      <ModalHeader>
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-600">
            <BookOpenText size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-sky-600">Onboarding</p>
            <h2 className="text-2xl font-extrabold text-slate-900">新员工入职手册</h2>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-1 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
            <CircleCheckBig size={16} />
            终极目标
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            苟活 30 天拿 N+1 赔偿金光荣退休，或者在股市赚够 <span className="font-semibold">$50,000</span>{' '}
            提前财富自由。
          </p>
        </section>

        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="mb-1 inline-flex items-center gap-1 text-sm font-semibold text-rose-700">
            <TriangleAlert size={16} />
            生存法则
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            时刻关注【精力】和【精神】，跌破 20 将积累亚健康，一旦进入【生病/抑郁】就可能触发坏结局。
          </p>
        </section>

        <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="mb-1 inline-flex items-center gap-1 text-sm font-semibold text-indigo-700">
            <Sparkles size={16} />
            摸鱼提示
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            手机里的内幕消息和天桥下的算卦道人，真真假假参半，请用你的【运气】和【智慧】去甄别。
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-sm font-semibold text-slate-800">一天的流程怎么走？</p>
          <div className="grid gap-2 text-sm text-slate-700 lg:grid-cols-3">
            <p className="rounded-xl border border-slate-200 bg-white p-3">白天点击选项，处理 2-4 个突发事件。</p>
            <p className="rounded-xl border border-slate-200 bg-white p-3">事件跑完后，点击“打卡下班”进入结算。</p>
            <p className="rounded-xl border border-slate-200 bg-white p-3">结算工资、股价、耐久、健康，再进入下一天。</p>
          </div>
        </section>

        <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <p className="mb-2 text-sm font-semibold text-sky-700">属性作用总览</p>
          <div className="grid gap-2 text-xs text-slate-700 lg:grid-cols-2">
            <p className="rounded-xl border border-sky-200 bg-white p-3">资金：消费、炒股、投资都靠它，低于 0 有破产风险。</p>
            <p className="rounded-xl border border-sky-200 bg-white p-3">精力：过低会触发亚健康，归零直接出局。</p>
            <p className="rounded-xl border border-sky-200 bg-white p-3">精神：过低会抑郁/幻觉，归零直接出局。</p>
            <p className="rounded-xl border border-sky-200 bg-white p-3">老板好感：影响职场事件走向和惩罚强度。</p>
            <p className="rounded-xl border border-sky-200 bg-white p-3">同事关系：影响电瓶、帮忙、八卦线索质量。</p>
            <p className="rounded-xl border border-sky-200 bg-white p-3">甲方满意：影响项目奖金和离谱需求频率。</p>
            <p className="rounded-xl border border-sky-200 bg-white p-3">智慧：越高越容易识破消息真假，也更容易拿高额奖金。</p>
            <p className="rounded-xl border border-sky-200 bg-white p-3">运气：每天暗中变化，影响股市和剧情后果。</p>
          </div>
        </section>

        <section className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <p className="mb-2 text-sm font-semibold text-violet-700">功能系统说明</p>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="rounded-xl border border-violet-200 bg-white p-3">
              便利店：花钱即时恢复/治疗，也有“有副作用”的毒性道具。价格高，但关键时刻能救命。
            </p>
            <p className="rounded-xl border border-violet-200 bg-white p-3">
              摸鱼炒股：基金稳、科技股中风险、土狗币高波动。每天结算后刷新价格，可买入 1 股或全部卖出。
            </p>
            <p className="rounded-xl border border-violet-200 bg-white p-3">
              我的工位（背包）：推销商道具放这里。每日耐久 -1，坏了会消失；可二手卖回血。
            </p>
            <p className="rounded-xl border border-violet-200 bg-white p-3">
              手机消息：会收到真假混杂的职场/投资情报；“直觉分析”的准确率受智慧影响。
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
              <WandSparkles size={16} />
              打工魂：{Math.floor(soulPoints)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenSoulShop}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-amber-200 bg-white px-3 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100"
              >
                <Sparkles size={14} />
                灵魂商店
              </button>
              <button
                type="button"
                onClick={onOpenAchievements}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-indigo-200 bg-white px-3 text-sm font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
              >
                <Trophy size={14} />
                墓志铭与成就
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-sky-700">今日天赋池（随机 5 选 3）</p>
            <p className={`text-xs font-semibold ${isReadyToStart ? 'text-emerald-600' : 'text-slate-500'}`}>
              已选择 {selectedTalentCount}/{requiredTalentCount}
            </p>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {talentChoices.map((talent) => {
              const isSelected = selectedTalentIds.includes(talent.id)
              const isGoldenLocked = lockGoldenTalent && talent.id === 'golden-capital-smell' && isSelected

              return (
                <button
                  key={talent.id}
                  type="button"
                  onClick={() => onToggleTalent?.(talent.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    isSelected
                      ? 'border-sky-300 bg-white shadow-sm'
                      : 'border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {talent.name}
                    {isGoldenLocked ? '（已锁定）' : ''}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{talent.description}</p>
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">提示：每个天赋都有收益和代价，选满 3 个后才能签约入职。</p>
        </section>
      </ModalBody>

      <ModalFooter className="space-y-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!isReadyToStart}
          className="h-12 w-full rounded-2xl bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isReadyToStart ? '确认签署卖身契' : `请先选择 ${requiredTalentCount} 个天赋`}
        </button>

        <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>当前已选择 {selectedTalentCount}/{requiredTalentCount}，底部按钮会固定在这里，不再被内容挤走。</p>
          <button
            type="button"
            onClick={onCheatAddSoul}
            className="self-end text-[11px] text-slate-400 transition hover:text-amber-600"
          >
            dev +1000 魂
          </button>
        </div>
      </ModalFooter>
    </ModalShell>
  )
}

export default TutorialModal

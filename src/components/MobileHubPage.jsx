import { Award, BriefcaseBusiness, LineChart, ShoppingBag, ShoppingCart, Smartphone, Sparkles } from 'lucide-react'

function MobileHubPage({
  onOpenPhone,
  unreadPhoneCount = 0,
  onOpenShop,
  onOpenMarket,
  onOpenBackpack,
  onOpenSoulShop,
  onOpenAchievements,
  isInteractionLocked,
  isVictory,
}) {
  const hubItems = [
    {
      id: 'phone',
      label: '手机消息',
      description: unreadPhoneCount > 0 ? `有 ${unreadPhoneCount} 条未读消息` : '查看手机和小道消息',
      icon: Smartphone,
      onClick: onOpenPhone,
      accent: 'border-sky-200 bg-sky-50 text-sky-700',
      badge: unreadPhoneCount > 0 ? (unreadPhoneCount > 99 ? '99+' : unreadPhoneCount) : null,
    },
    {
      id: 'shop',
      label: '楼下便利店',
      description: '补状态、治疗、买一次性道具',
      icon: ShoppingCart,
      onClick: onOpenShop,
      accent: 'border-blue-200 bg-blue-50 text-blue-700',
    },
    {
      id: 'market',
      label: '摸鱼炒股',
      description: '盯盘、买卖基金和高波动资产',
      icon: LineChart,
      onClick: onOpenMarket,
      accent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      disabled: isVictory,
    },
    {
      id: 'backpack',
      label: '我的背包',
      description: '查看推销商道具和耐久度',
      icon: ShoppingBag,
      onClick: onOpenBackpack,
      accent: 'border-violet-200 bg-violet-50 text-violet-700',
      disabled: isVictory,
    },
    {
      id: 'soul-shop',
      label: '灵魂商店',
      description: '购买局外成长和元进度强化',
      icon: Sparkles,
      onClick: onOpenSoulShop,
      accent: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    {
      id: 'achievements',
      label: '成就图鉴',
      description: '查看墓志铭和已解锁成就',
      icon: Award,
      onClick: onOpenAchievements,
      accent: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    },
  ]

  return (
    <div className="min-h-full bg-white p-4">
      <div className="mx-auto flex min-h-full max-w-xl flex-col gap-4">
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Hub</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">广场</h2>
          <p className="mt-1 text-sm text-slate-500">把高频系统入口统一收进这里，手机端不再挤在聊天页顶部。</p>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          {hubItems.map((item) => {
            const Icon = item.icon
            const isDisabled = isInteractionLocked || item.disabled

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                disabled={isDisabled}
                className={`relative rounded-2xl border p-4 text-left shadow-sm transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${item.accent}`}
              >
                {item.badge ? (
                  <span className="absolute right-3 top-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                ) : null}
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80">
                  <Icon size={20} />
                </div>
                <p className="text-base font-semibold">{item.label}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </button>
            )
          })}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="inline-flex items-center gap-2 font-medium text-slate-800">
            <BriefcaseBusiness size={16} className="text-sky-500" />
            手机端工作流
          </div>
          <p className="mt-2">左右滑动即可在状态、打工、广场三页之间切换；底部导航会跟随当前页高亮。</p>
        </section>
      </div>
    </div>
  )
}

export default MobileHubPage

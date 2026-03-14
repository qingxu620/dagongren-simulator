import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BarChart3, MessageSquare, ShoppingCart } from 'lucide-react'
import AchievementGalleryModal from './components/AchievementGalleryModal'
import ApiKeyGateModal from './components/ApiKeyGateModal'
import BackpackModal from './components/BackpackModal'
import ChatPanel from './components/ChatPanel'
import EndgameSummaryModal from './components/EndgameSummaryModal'
import InputBar from './components/InputBar'
import InvestmentModal from './components/InvestmentModal'
import MobileHubPage from './components/MobileHubPage'
import MobileStatsPage from './components/MobileStatsPage'
import MysterySellerModal from './components/MysterySellerModal'
import PhoneDrawer from './components/PhoneDrawer'
import ResumeSaveModal from './components/ResumeSaveModal'
import ShopModal from './components/ShopModal'
import SidebarStats from './components/SidebarStats'
import SoulShopModal from './components/SoulShopModal'
import ToastStack from './components/ToastStack'
import TutorialModal from './components/TutorialModal'
import { getGameOverReason, requestDeepSeekResolution, requestDeepSeekTurn } from './lib/deepseek'

const API_KEY_STORAGE = 'dagongren.deepseek.api_key'
const GAME_SAVE_STORAGE = 'dagongren_save'
const SOUL_POINTS_STORAGE = 'dagongren.meta.soul_points'
const SOUL_UPGRADES_STORAGE = 'dagongren.meta.soul_upgrades'
const ACHIEVEMENTS_STORAGE = 'dagongren.meta.achievements'
const WIN_DAY = 30
const RICH_WIN_TARGET = 50_000
const DAILY_SALARY = 400
const SIDE_HUSTLE_LIMIT_PER_DAY = 2
const SIDE_HUSTLE_MIN_REWARD = 300
const SIDE_HUSTLE_MAX_REWARD = 800
const SIDE_HUSTLE_ENERGY_COST = 30
const SIDE_HUSTLE_SANITY_COST = 10
const SIDE_HUSTLE_BUST_RATE = 0.25
const SIDE_HUSTLE_BOSS_PENALTY = 20
const SIDE_HUSTLE_BUST_FINE = 500
const MIN_EVENTS_PER_DAY = 2
const MAX_EVENTS_PER_DAY = 4
const GAME_START_COMMAND = '游戏开始，请生成第一天的突发事件和3个选项'
const FORTUNE_TELLER_TRIGGER_RATE = 0.15
const SELLER_TRIGGER_RATE_MIN = 0.05
const SELLER_TRIGGER_RATE_MAX = 0.1
const INVESTMENT_PITCH_TRIGGER_RATE = 0.1
const FACTION_INVITE_TRIGGER_RATE = 0.08
const HOSPITAL_COST = 3000
const HOSPITAL_BOSS_ABSENCE_PENALTY = 30
const HOSPITAL_SKIP_TURNS = 3
const PHONE_MESSAGE_TRIGGER_RATE = 0.18
const SALARY_CLAWBACK_TRIGGER_RATE = 0.2
const SALARY_CLAWBACK_REASONS = ['团建费', '呼吸税', '左脚先踏进公司违规罚款', '工位空气使用费']
const LOADING_MESSAGES = [
  '老板正在偷偷查监控...',
  'HR 正在起草解雇通知...',
  '命运的齿轮卡住了...',
  '正在黑入同事的微信聊天记录...',
  '资本家的算盘正在疯狂拨动...',
  '正在计算你的剩余利用价值...',
]
const DEFAULT_END_DAY_BUTTON_TEXT = '🌙 终于熬到头了，打卡下班！'
const DEFAULT_VICTORY_TEXT = '【恭喜你，熬过了30天，成功拿着N+1赔偿金光荣退休！】'
const MONEY_SHAKE_THRESHOLD = 500
const STAT_SHAKE_THRESHOLD = 20
const SHAKE_DURATION_MS = 400
const AI_NEXT_EVENT_RATE = 60
const NEXT_EVENT_DELAY_MS = 2000

const LOCAL_EVENTS = [
  {
    narrative: '老板突然把你叫进办公室，让你把公司刚研发的 AI 核心代码免费发给他的亲戚。',
    options: ['严词拒绝，顺便普法', '偷偷埋个定时崩溃 Bug 再发', '立刻照做并补一个跪舔表情包'],
  },
  {
    narrative: '同事在工位上直播带货，想借你的电脑演示“年薪翻倍办公神机”。',
    options: ['借他三分钟，先看热闹', '拔掉网线装作电脑死机', '主动入镜帮他站台'],
  },
  {
    narrative: '甲方深夜发来 48 条语音，只总结成一句话：“感觉不对，再改改。”',
    options: ['要求对方写清需求文档', '把语音全转成 PPT 回怼', '秒回收到并继续燃烧自己'],
  },
  {
    narrative: '部门群里突然开始接龙晒步数，老板暗示步数最低的人今晚加班。',
    options: ['立刻疯狂抖手机刷步数', '发一张昨天的截图糊弄过去', '坦然垫底并申请加班餐升级'],
  },
  {
    narrative: '财务小姐姐悄悄问你，要不要一起报销一张根本不存在的打车票。',
    options: ['婉拒并假装没听见', '先问比例怎么分', '建议做成企业团建成本'],
  },
  {
    narrative: '前同事神秘兮兮发来消息，说有个“元宇宙政务 SaaS”项目正在招天选打工人。',
    options: ['问清商业模式再说', '立刻夸他 vision 很大', '把消息转给老板换好感'],
  },
  {
    narrative: '实习生把线上库删了，却先在群里@你说“是哥教我的热更新”。',
    options: ['当场澄清并自证清白', '先帮他救火，事后再算账', '顺势认领功劳赌一把'],
  },
  {
    narrative: '行政通知大家参加“自愿”企业文化大合唱，C 位默认留给最会来事的人。',
    options: ['装病申请远程办公', '拉着同事一起跑调', '主动冲到最前面表忠心'],
  },
  {
    narrative: '老板要求你周末去机场接客户，但报销标准只有一瓶矿泉水。',
    options: ['据理力争补贴和调休', '先答应再想办法蹭顺风车', '感恩戴德地说这是成长'],
  },
  {
    narrative: '工位下忽然出现一个匿名纸箱，贴着字条：“里面是改变命运的机会，别告诉 HR。”',
    options: ['打开看看再说', '直接交给保安', '抱回家当年会盲盒'],
  },
  {
    narrative: '项目群里有人匿名发起投票，主题是“谁最适合为全组背锅”。你的票数正在飙升。',
    options: ['立刻追查投票源头', '先给自己投一票显得大度', '把锅甩向隔壁组'],
  },
  {
    narrative: '厕所门口出现一位自称“组织部观察员”的神秘人，问你愿不愿意加入地下工位互助会。',
    options: ['先问加入后包不包午饭', '委婉拒绝并火速撤离', '立刻宣誓加入看看'],
  },
]

const DAILY_THEMES_POOL = [
  {
    name: '降本增效大裁员',
    description: '公司正在秘密拟定裁员名单，全员风声鹤唳。老板会把每个小失误都放大，但表现欲也更容易换来表扬。',
  },
  {
    name: '疯狂星期四',
    description: '全公司都在摸鱼等下班，空气里飘着炸鸡味。人际关系更容易升温，但所有人的专注力都很可疑。',
  },
  {
    name: '神秘的甲方视察',
    description: '金主爸爸今天微服私访，公司到处都是形式主义。任何和客户相关的细节都可能突然被放到聚光灯下。',
  },
  {
    name: '年终述职地狱',
    description: '大家都在疯狂包装 PPT 和功劳簿。今天职场充满抢功、甩锅和临时表演型加班。',
  },
  {
    name: '老板玄学管理日',
    description: '老板今天完全靠黄历和心情做决策，逻辑不再重要。离谱的举动反而可能误打误撞获得认可。',
  },
  {
    name: '审计风暴前夜',
    description: '财务、流程、报销和聊天记录都可能被翻出来。任何灰色操作都带着浓烈的危险气息。',
  },
  {
    name: '全员鸡血团建周',
    description: '企业文化像洪水一样扑来，所有人被迫积极。会来事的人如鱼得水，不合群的人容易被盯上。',
  },
  {
    name: '办公室谣言季',
    description: '茶水间和厕所门口的消息满天飞，真真假假难辨。人际关系和消息判断会比平时更关键。',
  },
  {
    name: '系统崩溃救火日',
    description: '线上系统摇摇欲坠，所有人都处于随时背锅的边缘。今天的每个决定都带着救火和甩锅的火药味。',
  },
  {
    name: '神秘资本空降',
    description: '听说有新投资人要来，公司人人都在装精英。夸张的表演、假消息和画大饼会明显增多。',
  },
  {
    name: '工位政治高压锅',
    description: '部门内部站队愈发明显，所有人都在观察谁跟谁是一伙的。帮派、同事关系和暗线接头更容易冒头。',
  },
  {
    name: '绩效冲刺末班车',
    description: '离绩效评定只剩最后一点时间，所有人都在抢最后的露脸机会。短期收益和长期后果都更极端。',
  },
]

const defaultSoulUpgrades = {
  starterCashBoost: false,
  lockGoldenTalent: false,
}

const achievementCatalog = [
  {
    id: 'a_share_lamp',
    title: 'A股冥灯',
    condition: '因为买股票/土狗币导致破产。',
    comment: '你一买就跌，一卖就涨，交易软件都怕你上线。',
  },
  {
    id: 'rooftop_regular',
    title: '天台常客',
    condition: '同时处于生病与抑郁超过 3 天致死。',
    comment: '天台风很大，但你再也不用打卡了。',
  },
  {
    id: 'anti_fraud_shame',
    title: '反诈耻辱',
    condition: '在特殊投资事件中被骗光所有钱。',
    comment: '你不是投资人，你是别人 PPT 的赞助商。',
  },
  {
    id: 'capital_son',
    title: '资本家的好大儿',
    condition: '成功存活 30 天通关，但最终资金少于 $1000。',
    comment: '你活了下来，但钱包只剩空气。',
  },
  {
    id: 'early_retire',
    title: '提前退休',
    condition: '资产达到 $50,000，提前财富自由通关。',
    comment: '你终于从打工地狱里赎回了自己。',
  },
]

const SELLER_FOLLOWUP_OPTIONS = [
  '先看看推销商都带了什么鬼东西',
  '假装很忙，继续推进手头工作',
  '把他当情报贩子，试探公司八卦',
]

const officeFactions = [
  {
    name: '带薪拉屎神教',
    slogan: '信奉厕所是唯一的避风港。',
    bonusHint: '入教暗号：工位再卷，也要守住厕位。',
  },
  {
    name: '摸鱼刺客联盟',
    slogan: '主张在老板眼皮底下隐身。',
    bonusHint: '联盟宣言：鼠标移动即伪装，键盘敲击即烟幕。',
  },
  {
    name: '内卷修仙宗',
    slogan: '认为加班是渡劫，熬夜是修仙。',
    bonusHint: '宗门心法：凌晨两点写周报，方可飞升。 ',
  },
]

const INVESTMENT_FOLLOWUP_OPTIONS = [
  '继续推进今天的工作',
  '和同事复盘刚才那笔投资',
  '暂时按兵不动，观察后续风向',
]

const marketAssets = [
  { key: 'fund', name: '基金 (Fund)', riskLabel: '极低风险，回合波动 -2% ~ +3%' },
  { key: 'techStock', name: '科技股 (TechStock)', riskLabel: '中等风险，回合波动 -10% ~ +15%' },
  { key: 'crypto', name: '土狗币 (Crypto)', riskLabel: '极高风险，回合波动 -40% ~ +80%' },
]

const investmentProjectNames = ['前同事量化私募局', '老同学跨境电商盘', 'AI矿机托管计划', '境外虚拟币做市计划']

const sellerTemplates = [
  {
    name: '二手大忽悠秘籍',
    priceRange: [80, 140],
    effect: '智慧 +10',
    effectDelta: { wisdom: 10 },
    hiddenFlaw: '开会时会不自觉夸大承诺，容易被当场追责。',
    durabilityRange: [4, 6],
  },
  {
    name: '外星人陨石键盘',
    priceRange: [120, 190],
    effect: '运气 +15',
    effectDelta: { luck: 15 },
    hiddenFlaw: '关键时刻偶尔漏电，可能随机清空正在输入的内容。',
    durabilityRange: [3, 5],
  },
  {
    name: '匿名背锅话术卡',
    priceRange: [60, 100],
    effect: '同事关系 +8',
    effectDelta: { colleagueFavor: 8 },
    hiddenFlaw: '容易说漏嘴，被同事认为你在甩锅。',
    durabilityRange: [3, 5],
  },
  {
    name: '甲方安抚香薰',
    priceRange: [70, 120],
    effect: '甲方满意度 +10',
    effectDelta: { clientFavor: 10 },
    hiddenFlaw: '味道太冲，偶尔会激怒会议室里的所有人。',
    durabilityRange: [4, 6],
  },
  {
    name: '加班神经稳定贴',
    priceRange: [50, 90],
    effect: '精神 +12',
    effectDelta: { sanity: 12 },
    hiddenFlaw: '副作用是白天犯困，早会状态可能断崖式下跌。',
    durabilityRange: [3, 5],
  },
]

const initialMarketPrices = {
  fund: 20,
  techStock: 50,
  crypto: 100,
}

const initialHoldings = {
  fund: 0,
  techStock: 0,
  crypto: 0,
}

const TALENT_PICK_COUNT = 5
const TALENT_SELECT_REQUIRED = 3
const GOLDEN_TALENT_ID = 'golden-capital-smell'

const talentPool = [
  { id: GOLDEN_TALENT_ID, name: '金色天赋：资本嗅觉', description: '智慧 +20，老板好感 +10。', effects: { wisdom: 20, bossFavor: 10 } },
  { id: 'coffee-blood', name: '咖啡代谢核', description: '精力 +18，但精神 -8。', effects: { energy: 18, sanity: -8 } },
  { id: 'social-joker', name: '社交杂技演员', description: '同事关系 +15，但老板好感 -6。', effects: { colleagueFavor: 15, bossFavor: -6 } },
  { id: 'client-whisperer', name: '甲方读心术', description: '甲方满意度 +16，但精神 -6。', effects: { clientFavor: 16, sanity: -6 } },
  { id: 'salary-negotiator', name: '薪资谈判鬼才', description: '开局资金 +1200，但老板好感 -10。', effects: { money: 1200, bossFavor: -10 } },
  { id: 'toilet-meditation', name: '厕所冥想家', description: '精神 +14，精力 +8。', effects: { sanity: 14, energy: 8 } },
  { id: 'night-owl', name: '熬夜仙人', description: '智慧 +12，精力 -12。', effects: { wisdom: 12, energy: -12 } },
  { id: 'coin-gambler', name: '币圈赌徒体质', description: '运气 +18，精神 -10。', effects: { luck: 18, sanity: -10 } },
  { id: 'office-ninja', name: '工位潜行者', description: '老板好感 +8，同事关系 +8。', effects: { bossFavor: 8, colleagueFavor: 8 } },
  { id: 'heart-of-steel', name: '铁石心肠', description: '精神 +20，但同事关系 -10。', effects: { sanity: 20, colleagueFavor: -10 } },
  { id: 'overtime-demon', name: '加班恶魔契约', description: '精力 +22，但运气 -12。', effects: { energy: 22, luck: -12 } },
  { id: 'humble-actor', name: '谦卑演技派', description: '老板好感 +14，智慧 -8。', effects: { bossFavor: 14, wisdom: -8 } },
]

function pickTalentChoices(soulUpgrades = defaultSoulUpgrades) {
  const pool = [...talentPool]
  if (!soulUpgrades.lockGoldenTalent) {
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = randomInt(0, i)
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool.slice(0, TALENT_PICK_COUNT)
  }

  const golden = pool.find((item) => item.id === GOLDEN_TALENT_ID)
  const others = pool.filter((item) => item.id !== GOLDEN_TALENT_ID)
  for (let i = others.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i)
    ;[others[i], others[j]] = [others[j], others[i]]
  }
  const picked = [golden, ...others.slice(0, TALENT_PICK_COUNT - 1)].filter(Boolean)
  for (let i = picked.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i)
    ;[picked[i], picked[j]] = [picked[j], picked[i]]
  }
  return picked
}

function getInitialSelectedTalentIds(soulUpgrades = defaultSoulUpgrades, choices = []) {
  if (!soulUpgrades.lockGoldenTalent) {
    return []
  }
  return choices.some((item) => item.id === GOLDEN_TALENT_ID) ? [GOLDEN_TALENT_ID] : []
}

function createTalentSelectionState(soulUpgrades = defaultSoulUpgrades) {
  const choices = pickTalentChoices(soulUpgrades)
  return {
    choices,
    selectedIds: getInitialSelectedTalentIds(soulUpgrades, choices),
  }
}

function resolveSelectedTalents(choices = [], selectedIds = []) {
  const selectedIdSet = new Set(selectedIds)
  return choices.filter((item) => selectedIdSet.has(item.id))
}

function safeReadFromStorage(key, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return fallbackValue
    }
    return JSON.parse(raw)
  } catch {
    return fallbackValue
  }
}

function safeWriteToStorage(key, value) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore localStorage write errors in private mode.
  }
}

function safeRemoveFromStorage(key) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore localStorage remove errors in private mode.
  }
}

function loadSavedGame() {
  const raw = safeReadFromStorage(GAME_SAVE_STORAGE, null)
  if (!raw || typeof raw !== 'object') {
    return null
  }

  return raw
}

function loadSoulUpgrades() {
  const raw = safeReadFromStorage(SOUL_UPGRADES_STORAGE, defaultSoulUpgrades)
  return {
    starterCashBoost: Boolean(raw?.starterCashBoost),
    lockGoldenTalent: Boolean(raw?.lockGoldenTalent),
  }
}

function loadSoulPoints() {
  const raw = safeReadFromStorage(SOUL_POINTS_STORAGE, 0)
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0
}

function loadUnlockedAchievements() {
  const raw = safeReadFromStorage(ACHIEVEMENTS_STORAGE, [])
  return Array.isArray(raw) ? raw.filter((item) => typeof item === 'string') : []
}

const shopItems = [
  {
    id: 'iced-americano',
    name: '冰美式',
    cost: 100,
    description: '续命神器，给濒临报废的大脑打满鸡血。',
    effectText: '精力 +30',
    effects: { energy: 30 },
  },
  {
    id: 'therapy',
    name: '看心理医生',
    cost: 100,
    description: '专业疏导，帮你把压力暂时从天灵盖卸下来。',
    effectText: '精神 +50',
    effects: { sanity: 50 },
  },
  {
    id: 'old-noodle',
    name: '老坛酸菜面',
    cost: 40,
    description: '便宜顶饱，但味道让灵魂发出抗议。',
    effectText: '精力 +30，精神 -15',
    effects: { energy: 30, sanity: -15 },
  },
  {
    id: 'cheap-beer',
    name: '冰镇廉价啤酒',
    cost: 50,
    description: '短暂快乐，后劲上来就只想趴桌睡觉。',
    effectText: '精神 +40，精力 -20',
    effects: { sanity: 40, energy: -20 },
  },
  {
    id: 'cold-medicine',
    name: '速效感冒药',
    cost: 850,
    description: '快速退烧止咳，但只能勉强续命。',
    effectText: '解除生病，精力 +10',
    effects: { energy: 10 },
    cures: { sick: true },
  },
  {
    id: 'mental-medicine',
    name: '心理特效药',
    cost: 900,
    description: '强行把你从情绪深渊里拉回来一点。',
    effectText: '解除抑郁，精神 +20',
    effects: { sanity: 20 },
    cures: { depressed: true },
  },
  {
    id: 'boss-guide',
    name: '高级马屁精教程',
    cost: 150,
    description: '职场社交黑话秘籍，专治老板阴晴不定。',
    effectText: '老板好感 +40',
    effects: { bossFavor: 40 },
  },
]

const initialGameState = {
  day: 1,
  money: 55,
  energy: 75,
  sanity: 65,
  bossFavor: 40,
  colleagueFavor: 50,
  clientFavor: 50,
  wisdom: 50,
  luck: 55,
  faction: '无党派牛马',
}

function createInitialGameState(soulUpgrades = defaultSoulUpgrades, selectedTalents = []) {
  let nextState = {
    ...initialGameState,
    wisdom: randomInt(30, 70),
    luck: randomInt(30, 70),
  }
  if (soulUpgrades.starterCashBoost) {
    nextState.money = roundToCents(nextState.money + 2000)
  }
  if (soulUpgrades.lockGoldenTalent) {
    nextState.wisdom = clampStat(nextState.wisdom + 12)
  }
  selectedTalents.forEach((talent) => {
    nextState = applyEffectDeltaToState(nextState, talent.effects || {})
  })
  return nextState
}

const initialHealthState = {
  sick: false,
  depressed: false,
  sickDays: 0,
  depressedDays: 0,
  dualDebuffDays: 0,
  lowEnergyDays: 0,
  lowSanityDays: 0,
  hospitalTurnsRemaining: 0,
}

const initialMessages = [
  {
    id: 'boot-message',
    role: 'system',
    content: '【系统】请输入并保存 DeepSeek API Key，系统会自动生成第一天的突发事件。',
  },
]

const ZERO_CHANGE_PAYLOAD = {
  moneyChange: 0,
  energyChange: 0,
  sanityChange: 0,
  bossFavorChange: 0,
  colleagueFavorChange: 0,
  clientFavorChange: 0,
}

function createMessage(role, content, changes) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    changes: changes || null,
  }
}

function createChangePayload(partial) {
  return {
    ...ZERO_CHANGE_PAYLOAD,
    ...partial,
  }
}

function shouldTriggerShake(changes) {
  if (!changes) {
    return false
  }
  return (
    Number(changes.moneyChange || 0) <= -MONEY_SHAKE_THRESHOLD ||
    Number(changes.energyChange || 0) <= -STAT_SHAKE_THRESHOLD ||
    Number(changes.sanityChange || 0) <= -STAT_SHAKE_THRESHOLD
  )
}

function calculateSoulPointsReward(day, finalMoney) {
  const survivedDays = Math.max(1, Math.floor(day))
  const reward = survivedDays * 10 + Math.floor(Number(finalMoney || 0) / 100)
  return Math.max(0, reward)
}

function getAchievementTitleById(id) {
  return achievementCatalog.find((item) => item.id === id)?.title || id
}

function clampStat(value) {
  return Math.max(0, Math.min(100, value))
}

function roundToCents(value) {
  return Number(value.toFixed(2))
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1))
}

function shuffleArray(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function pickRandomLocalEvent() {
  const picked = LOCAL_EVENTS[randomInt(0, LOCAL_EVENTS.length - 1)] || LOCAL_EVENTS[0]
  return {
    narrative: picked.narrative,
    options: Array.isArray(picked.options) ? picked.options.slice(0, 3) : [],
  }
}

function pickRandomDailyTheme(excludedName = '') {
  const pool =
    DAILY_THEMES_POOL.length > 1 && excludedName
      ? DAILY_THEMES_POOL.filter((item) => item.name !== excludedName)
      : DAILY_THEMES_POOL

  return pool[randomInt(0, pool.length - 1)] || DAILY_THEMES_POOL[0] || null
}

function createActiveEventSnapshot({
  narrative,
  options = [],
  source = 'local',
  mode = 'daily_workplace',
  specialEventType = 'normal',
  requireInvestmentInput = false,
  eventIndex = 1,
}) {
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    narrative,
    options,
    source,
    mode,
    specialEventType,
    requireInvestmentInput: Boolean(requireInvestmentInput),
    eventIndex,
  }
}

function rollSalaryWithCapitalistClawback(baseSalary) {
  const salary = Math.max(0, Number(baseSalary) || 0)
  if (Math.random() >= SALARY_CLAWBACK_TRIGGER_RATE) {
    return {
      salaryGain: salary,
      deductedAmount: 0,
      reason: null,
      deductionRate: 0,
    }
  }

  const deductionRate = Math.random() < 0.5 ? 0.5 : 1
  const deductedAmount = roundToCents(salary * deductionRate)
  const salaryGain = roundToCents(salary - deductedAmount)
  const reason = SALARY_CLAWBACK_REASONS[randomInt(0, SALARY_CLAWBACK_REASONS.length - 1)]

  return {
    salaryGain,
    deductedAmount,
    reason,
    deductionRate,
  }
}

function rollMaxEventsToday() {
  return randomInt(MIN_EVENTS_PER_DAY, MAX_EVENTS_PER_DAY)
}

function rollDailyLuck() {
  return randomInt(1, 100)
}

function getIntraDayPeriod(eventIndex, maxEventsToday) {
  if (maxEventsToday <= 1) {
    return '上午'
  }
  const progress = eventIndex / maxEventsToday
  if (progress <= 0.34) {
    return '上午'
  }
  if (progress <= 0.67) {
    return '下午'
  }
  return '傍晚'
}

function rollSpecialEventType() {
  const eventRoll = Math.random()
  const sellerTriggerRate = randomBetween(SELLER_TRIGGER_RATE_MIN, SELLER_TRIGGER_RATE_MAX)
  if (eventRoll < FORTUNE_TELLER_TRIGGER_RATE) {
    return 'fortune_teller'
  }
  if (eventRoll < FORTUNE_TELLER_TRIGGER_RATE + sellerTriggerRate) {
    return 'seller'
  }
  if (
    eventRoll <
    FORTUNE_TELLER_TRIGGER_RATE + sellerTriggerRate + INVESTMENT_PITCH_TRIGGER_RATE
  ) {
    return 'investment_pitch'
  }
  if (
    eventRoll <
    FORTUNE_TELLER_TRIGGER_RATE +
      sellerTriggerRate +
      INVESTMENT_PITCH_TRIGGER_RATE +
      FACTION_INVITE_TRIGGER_RATE
  ) {
    return 'faction_invite'
  }
  return 'normal'
}

function createFactionInviteEvent(currentFaction) {
  const pool = officeFactions.filter((item) => item.name !== currentFaction)
  const target = pool[randomInt(0, pool.length - 1)] || officeFactions[0]
  const joinOption = `接过纸条，加入【${target.name}】`
  const refuseOption = '婉拒入伙，继续当无党派牛马'
  const evadeOption = '装作没听见，抱着咖啡快速撤离'

  return {
    targetFaction: target.name,
    narrative: `【神秘纸条】同事悄悄把你拉到茶水间角落，低声问你要不要加入「${target.name}」。${target.slogan} ${target.bonusHint}`,
    options: [joinOption, refuseOption, evadeOption],
    joinOption,
  }
}

function getLuckFactor(luck) {
  if (luck > 60) {
    return (luck - 60) / 40
  }
  if (luck < 40) {
    return -((40 - luck) / 40)
  }
  return 0
}

function sampleVolatility(baseDown, baseUp, assetKey, luck) {
  const luckFactor = getLuckFactor(luck)
  let down = baseDown
  let up = baseUp

  if (luckFactor > 0) {
    down *= 1 - 0.35 * luckFactor
    up *= 1 + 0.5 * luckFactor
  } else if (luckFactor < 0) {
    const penalty = -luckFactor
    down *= 1 + 0.6 * penalty
    up *= 1 - 0.35 * penalty
  }

  let rate = randomBetween(-down, up)

  if (luckFactor > 0) {
    rate += up * 0.08 * luckFactor
  } else if (luckFactor < 0) {
    rate -= down * 0.1 * -luckFactor
  }

  if (assetKey === 'crypto' && luckFactor < 0) {
    const penalty = -luckFactor
    const crashChance = 0.3 + 0.45 * penalty
    if (Math.random() < crashChance) {
      rate = -randomBetween(down * 0.9, down * 1.6)
    }
  }

  return Math.max(-0.95, rate)
}

function refreshMarketPrices(currentPrices, luck) {
  const fundRate = sampleVolatility(0.02, 0.03, 'fund', luck)
  const techRate = sampleVolatility(0.1, 0.15, 'techStock', luck)
  const cryptoRate = sampleVolatility(0.4, 0.8, 'crypto', luck)

  return {
    fund: Math.max(1, roundToCents(currentPrices.fund * (1 + fundRate))),
    techStock: Math.max(1, roundToCents(currentPrices.techStock * (1 + techRate))),
    crypto: Math.max(1, roundToCents(currentPrices.crypto * (1 + cryptoRate))),
  }
}

function generateSellerOffers() {
  const shuffled = [...sellerTemplates].sort(() => Math.random() - 0.5)
  const count = randomInt(1, 2)

  return shuffled.slice(0, count).map((template) => {
    const maxDurability = randomInt(template.durabilityRange[0], template.durabilityRange[1])

    return {
      id: `offer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: template.name,
      price: randomInt(template.priceRange[0], template.priceRange[1]),
      effect: template.effect,
      effectDelta: template.effectDelta,
      hiddenFlaw: template.hiddenFlaw,
      durability: maxDurability,
      maxDurability,
    }
  })
}

function getAssetNameByKey(assetKey) {
  return marketAssets.find((item) => item.key === assetKey)?.name || assetKey
}

function getPortfolioMarketValue(currentHoldings, currentMarketPrices) {
  return Object.entries(currentHoldings).reduce((sum, [assetKey, amount]) => {
    return sum + amount * currentMarketPrices[assetKey]
  }, 0)
}

function getResalePrice(item) {
  return Math.floor(item.price * 0.7 * (item.durability / item.maxDurability))
}

function decayInventory(currentInventory) {
  const brokenItems = []
  const nextInventory = []

  currentInventory.forEach((item) => {
    const nextDurability = item.durability - 1
    if (nextDurability <= 0) {
      brokenItems.push(item)
      return
    }
    nextInventory.push({
      ...item,
      durability: nextDurability,
    })
  })

  return {
    nextInventory,
    brokenItems,
  }
}

function applyEffectDeltaToState(baseState, effectDelta = {}) {
  const nextState = { ...baseState }

  Object.entries(effectDelta).forEach(([key, value]) => {
    if (key === 'money') {
      nextState.money = roundToCents(nextState.money + value)
      return
    }

    if (key in nextState) {
      nextState[key] = clampStat(nextState[key] + value)
    }
  })

  return nextState
}

function applyEventStatChanges(baseState, statChanges = {}) {
  return {
    ...baseState,
    money: roundToCents(baseState.money + (statChanges.money || 0)),
    energy: clampStat(baseState.energy + (statChanges.energy || 0)),
    sanity: clampStat(baseState.sanity + (statChanges.sanity || 0)),
    bossFavor: clampStat(baseState.bossFavor + (statChanges.bossFavor || 0)),
    colleagueFavor: clampStat(baseState.colleagueFavor + (statChanges.colleagueFavor || 0)),
    clientFavor: clampStat(baseState.clientFavor + (statChanges.clientFavor || 0)),
    wisdom: clampStat(baseState.wisdom),
    luck: clampStat(baseState.luck),
  }
}

function effectDeltaToChangePayload(itemCost, effectDelta = {}) {
  return createChangePayload({
    moneyChange: -itemCost,
    energyChange: effectDelta.energy || 0,
    sanityChange: effectDelta.sanity || 0,
    bossFavorChange: effectDelta.bossFavor || 0,
    colleagueFavorChange: effectDelta.colleagueFavor || 0,
    clientFavorChange: effectDelta.clientFavor || 0,
  })
}

function clearAllDebuffs(baseHealthState) {
  return {
    ...baseHealthState,
    sick: false,
    depressed: false,
    sickDays: 0,
    depressedDays: 0,
    dualDebuffDays: 0,
    lowEnergyDays: 0,
    lowSanityDays: 0,
  }
}

function getAfflictionChance(value, lowDays) {
  if (value >= 50) {
    return 0
  }
  if (value < 20) {
    return Math.min(0.22 + lowDays * 0.14, 0.95)
  }
  return Math.min(0.05 + lowDays * 0.04, 0.5)
}

function evaluateHealthAfterDay(baseHealthState, gameState, options = {}) {
  const { skipAfflictionCheck = false } = options
  const nextHealthState = { ...baseHealthState }
  const events = []

  const lowEnergyDays = gameState.energy < 50 ? baseHealthState.lowEnergyDays + 1 : 0
  const lowSanityDays = gameState.sanity < 50 ? baseHealthState.lowSanityDays + 1 : 0
  nextHealthState.lowEnergyDays = lowEnergyDays
  nextHealthState.lowSanityDays = lowSanityDays

  if (skipAfflictionCheck) {
    nextHealthState.sickDays = nextHealthState.sick ? baseHealthState.sickDays + 1 : 0
    nextHealthState.depressedDays = nextHealthState.depressed ? baseHealthState.depressedDays + 1 : 0
    nextHealthState.dualDebuffDays =
      nextHealthState.sick && nextHealthState.depressed ? baseHealthState.dualDebuffDays + 1 : 0
    return { nextHealthState, events }
  }

  if (baseHealthState.sick) {
    nextHealthState.sick = true
    nextHealthState.sickDays = baseHealthState.sickDays + 1
  } else {
    const sickChance = getAfflictionChance(gameState.energy, lowEnergyDays)
    if (Math.random() < sickChance) {
      nextHealthState.sick = true
      nextHealthState.sickDays = 1
      events.push('亚健康爆发：你开始发烧咳嗽，进入【生病】状态。')
    } else {
      nextHealthState.sick = false
      nextHealthState.sickDays = 0
    }
  }

  if (baseHealthState.depressed) {
    nextHealthState.depressed = true
    nextHealthState.depressedDays = baseHealthState.depressedDays + 1
  } else {
    const depressedChance = getAfflictionChance(gameState.sanity, lowSanityDays)
    if (Math.random() < depressedChance) {
      nextHealthState.depressed = true
      nextHealthState.depressedDays = 1
      events.push('情绪崩溃临界：你陷入持续低落，进入【抑郁】状态。')
    } else {
      nextHealthState.depressed = false
      nextHealthState.depressedDays = 0
    }
  }

  nextHealthState.dualDebuffDays =
    nextHealthState.sick && nextHealthState.depressed ? baseHealthState.dualDebuffDays + 1 : 0

  return { nextHealthState, events }
}

function generateMarketRumorMessage(luck) {
  const asset = marketAssets[randomInt(0, marketAssets.length - 1)]
  const trend = Math.random() < 0.5 ? '大涨' : '大跌'
  const truthChance = Math.max(0.2, Math.min(0.85, 0.5 + (luck - 50) / 120))
  const isLikelyTrue = Math.random() < truthChance

  if (isLikelyTrue) {
    return {
      sender: ['同事老王', '行业群友', '财经号-盘后速递'][randomInt(0, 2)],
      content: `内部风声：${asset.name} 可能会${trend}，但别全信，先做风控。`,
      isTrue: true,
    }
  }

  return {
    sender: ['陌生号码', '营销号-暴富指南', '匿名爆料人'][randomInt(0, 2)],
    content: `小道消息：${asset.name} 今晚“稳稳${trend}”，现在不冲就晚了！`,
    isTrue: false,
  }
}

function generateGeneralPhoneMessage() {
  const pool = [
    { sender: '老板', content: '今晚临时加个会，顺便把明天的方案一起准备了。', isTrue: true },
    { sender: '同事小李', content: '听说甲方又改需求了，下午可能要全员返工。', isTrue: true },
    { sender: '诈骗短信', content: '您已中签“内部原始股”，点击链接立即认购。', isTrue: false },
    { sender: '新闻快讯', content: '某头部公司裁员传闻再起，板块波动加剧。', isTrue: true },
  ]
  return pool[randomInt(0, pool.length - 1)]
}

function generateDailyPhoneMessages(luck) {
  return [Math.random() < 0.6 ? generateMarketRumorMessage(luck) : generateGeneralPhoneMessage()]
}

function createPendingInvestment(amount, currentDay, luck) {
  const resolveIn = randomInt(3, 5)
  const successChance = Math.max(0.12, Math.min(0.88, 0.45 + (luck - 50) * 0.008))
  const isSuccess = Math.random() < successChance
  const multiplier = isSuccess ? randomBetween(1.4, 3.6) : randomBetween(0, 0.35)
  const payout = roundToCents(amount * multiplier)
  const projectName = investmentProjectNames[randomInt(0, investmentProjectNames.length - 1)]

  return {
    id: `invest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    amount,
    payout,
    resolveDay: currentDay + resolveIn,
    isSuccess,
    projectName,
  }
}

function settlePendingInvestments(pendingInvestments, currentDay) {
  const resolved = []
  const nextPending = []
  let totalPayout = 0

  pendingInvestments.forEach((item) => {
    if (item.resolveDay <= currentDay) {
      resolved.push(item)
      totalPayout += item.payout
      return
    }
    nextPending.push(item)
  })

  return {
    resolved,
    nextPending,
    totalPayout: roundToCents(totalPayout),
  }
}

function isRunTerminal(nextState, nextHealthState, holdings, marketPrices) {
  const totalAssetValue = nextState.money + getPortfolioMarketValue(holdings, marketPrices)
  return (
    (nextHealthState.sick && nextHealthState.depressed && nextHealthState.dualDebuffDays > 3) ||
    nextState.money < 0 ||
    totalAssetValue <= 0 ||
    Boolean(getGameOverReason(nextState)) ||
    totalAssetValue >= RICH_WIN_TARGET ||
    nextState.day >= WIN_DAY
  )
}

function buildIntuitionAnalysis(isTrue, wisdom) {
  const roll = randomInt(1, 100)
  const passedCheck = roll < clampStat(wisdom)
  const judgedTrue = passedCheck ? isTrue : !isTrue
  const hint = judgedTrue ? '这绝对是靠谱的内幕！' : '一眼假，纯纯的杀猪盘！'
  return {
    text: hint,
    passedCheck,
  }
}

function createPhoneInboxMessage(message, day, wisdom) {
  const analysis = buildIntuitionAnalysis(Boolean(message.isTrue), wisdom)
  return {
    id: `phone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender: message.sender,
    content: message.content,
    isTrue: Boolean(message.isTrue),
    intuition: analysis.text,
    intuitionPass: analysis.passedCheck,
    day,
    isRead: false,
  }
}

function normalizePhoneMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) {
    return []
  }

  return rawMessages
    .map((item) => ({
      sender: typeof item?.sender === 'string' ? item.sender.trim() : '',
      content: typeof item?.content === 'string' ? item.content.trim() : '',
      isTrue: Boolean(item?.isTrue),
    }))
    .filter((item) => item.sender && item.content)
    .slice(0, 3)
}

function App() {
  const [soulUpgrades, setSoulUpgrades] = useState(() => loadSoulUpgrades())
  const [soulPoints, setSoulPoints] = useState(() => loadSoulPoints())
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => loadUnlockedAchievements())

  const [talentSelection, setTalentSelection] = useState(() =>
    createTalentSelectionState(loadSoulUpgrades()),
  )
  const [gameState, setGameState] = useState(() => createInitialGameState(loadSoulUpgrades()))
  const [healthState, setHealthState] = useState(initialHealthState)
  const [messages, setMessages] = useState(initialMessages)
  const [phoneMessages, setPhoneMessages] = useState([])
  const [pendingInvestments, setPendingInvestments] = useState([])
  const [investmentRequest, setInvestmentRequest] = useState(null)
  const [investmentAmount, setInvestmentAmount] = useState(0)
  const [currentDailyTheme, setCurrentDailyTheme] = useState(() => pickRandomDailyTheme())
  const [loadingText, setLoadingText] = useState('')
  const [isTutorialOpen, setIsTutorialOpen] = useState(true)
  const [currentOptions, setCurrentOptions] = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [activeFactionInvite, setActiveFactionInvite] = useState(null)
  const [eventsToday, setEventsToday] = useState(0)
  const [maxEventsToday, setMaxEventsToday] = useState(() => rollMaxEventsToday())
  const [isAwaitingEndDay, setIsAwaitingEndDay] = useState(false)
  const [endDayButtonText, setEndDayButtonText] = useState(DEFAULT_END_DAY_BUTTON_TEXT)
  const [sideHustlesToday, setSideHustlesToday] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isScreenShaking, setIsScreenShaking] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isVictory, setIsVictory] = useState(false)
  const [victoryText, setVictoryText] = useState(DEFAULT_VICTORY_TEXT)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [isMarketOpen, setIsMarketOpen] = useState(false)
  const [isSellerOpen, setIsSellerOpen] = useState(false)
  const [isBackpackOpen, setIsBackpackOpen] = useState(false)
  const [isPhoneOpen, setIsPhoneOpen] = useState(false)
  const [shopErrorMessage, setShopErrorMessage] = useState('')
  const [marketErrorMessage, setMarketErrorMessage] = useState('')
  const [sellerErrorMessage, setSellerErrorMessage] = useState('')
  const [backpackErrorMessage, setBackpackErrorMessage] = useState('')
  const [marketPrices, setMarketPrices] = useState(initialMarketPrices)
  const [holdings, setHoldings] = useState(initialHoldings)
  const [inventory, setInventory] = useState([])
  const [sellerOffers, setSellerOffers] = useState([])
  const [toasts, setToasts] = useState([])
  const [isSoulShopOpen, setIsSoulShopOpen] = useState(false)
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false)
  const [endgameSummary, setEndgameSummary] = useState(null)
  const [pendingSavedGame, setPendingSavedGame] = useState(null)

  const [apiKey, setApiKey] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiKeyStatus, setApiKeyStatus] = useState('')
  const [isApiKeyBootstrapped, setIsApiKeyBootstrapped] = useState(false)
  const [activeTab, setActiveTab] = useState(1)
  const [hasStarted, setHasStarted] = useState(false)
  const [talents, setTalents] = useState([])

  const gameStateRef = useRef(gameState)
  const healthStateRef = useRef(initialHealthState)
  const messagesRef = useRef(initialMessages)
  const phoneMessagesRef = useRef([])
  const pendingInvestmentsRef = useRef([])
  const marketPricesRef = useRef(initialMarketPrices)
  const holdingsRef = useRef(initialHoldings)
  const inventoryRef = useRef([])
  const dayMessageCandidatesRef = useRef([])
  const currentDailyThemeRef = useRef(currentDailyTheme)
  const activeEventRef = useRef(null)
  const activeFactionInviteRef = useRef(null)
  const eventsTodayRef = useRef(0)
  const maxEventsTodayRef = useRef(maxEventsToday)
  const isAwaitingEndDayRef = useRef(false)
  const mobilePagesRef = useRef(null)
  const activeTabRef = useRef(1)
  const sideHustlesTodayRef = useRef(0)
  const shakeTimerRef = useRef(null)
  const nextEventTimerRef = useRef(null)
  const hasSettledRunRef = useRef(false)
  const scamRuinRef = useRef(false)
  const soulPointsRef = useRef(soulPoints)
  const unlockedAchievementsRef = useRef(unlockedAchievements)
  const isResumePromptOpen = Boolean(pendingSavedGame)

  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  useEffect(() => {
    healthStateRef.current = healthState
  }, [healthState])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    phoneMessagesRef.current = phoneMessages
  }, [phoneMessages])

  useEffect(() => {
    pendingInvestmentsRef.current = pendingInvestments
  }, [pendingInvestments])

  useEffect(() => {
    marketPricesRef.current = marketPrices
  }, [marketPrices])

  useEffect(() => {
    holdingsRef.current = holdings
  }, [holdings])

  useEffect(() => {
    inventoryRef.current = inventory
  }, [inventory])

  useEffect(() => {
    currentDailyThemeRef.current = currentDailyTheme
  }, [currentDailyTheme])

  useEffect(() => {
    activeEventRef.current = activeEvent
  }, [activeEvent])

  useEffect(() => {
    activeFactionInviteRef.current = activeFactionInvite
  }, [activeFactionInvite])

  useEffect(() => {
    eventsTodayRef.current = eventsToday
  }, [eventsToday])

  useEffect(() => {
    maxEventsTodayRef.current = maxEventsToday
  }, [maxEventsToday])

  useEffect(() => {
    isAwaitingEndDayRef.current = isAwaitingEndDay
  }, [isAwaitingEndDay])

  useEffect(() => {
    sideHustlesTodayRef.current = sideHustlesToday
  }, [sideHustlesToday])

  useEffect(() => {
    soulPointsRef.current = soulPoints
    safeWriteToStorage(SOUL_POINTS_STORAGE, soulPoints)
  }, [soulPoints])

  useEffect(() => {
    unlockedAchievementsRef.current = unlockedAchievements
    safeWriteToStorage(ACHIEVEMENTS_STORAGE, unlockedAchievements)
  }, [unlockedAchievements])

  useEffect(() => {
    safeWriteToStorage(SOUL_UPGRADES_STORAGE, soulUpgrades)
  }, [soulUpgrades])

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) {
        window.clearTimeout(shakeTimerRef.current)
      }
      if (nextEventTimerRef.current) {
        window.clearTimeout(nextEventTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      setLoadingText('')
      return undefined
    }

    const pickRandomLoadingMessage = () =>
      LOADING_MESSAGES[randomInt(0, LOADING_MESSAGES.length - 1)] || LOADING_MESSAGES[0]

    setLoadingText(pickRandomLoadingMessage())
    const intervalId = window.setInterval(() => {
      setLoadingText(pickRandomLoadingMessage())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isLoading])

  useEffect(() => {
    const storedKey = window.localStorage.getItem(API_KEY_STORAGE) || ''
    if (storedKey) {
      setApiKey(storedKey)
      setApiKeyInput(storedKey)
      setApiKeyStatus('检测到本地已保存 Key。')
    }

    const savedGame = loadSavedGame()
    if (savedGame?.isGameStarted) {
      setPendingSavedGame(savedGame)
    }
    setIsApiKeyBootstrapped(true)
  }, [])

  const scrollToMobileTab = useCallback((tabIndex, behavior = 'smooth') => {
    const container = mobilePagesRef.current
    if (!container) {
      return
    }

    activeTabRef.current = tabIndex
    setActiveTab(tabIndex)
    container.scrollTo({
      left: container.clientWidth * tabIndex,
      behavior,
    })
  }, [])

  const handleMobilePagesScroll = useCallback((event) => {
    const container = event.currentTarget
    if (!container.clientWidth) {
      return
    }

    const nextTab = Math.max(0, Math.min(2, Math.round(container.scrollLeft / container.clientWidth)))
    if (nextTab !== activeTabRef.current) {
      activeTabRef.current = nextTab
      setActiveTab(nextTab)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const resizeToCurrentTab = () => {
      const container = mobilePagesRef.current
      if (!container) {
        return
      }
      container.scrollTo({
        left: container.clientWidth * activeTabRef.current,
        behavior: 'auto',
      })
    }

    const rafId = window.requestAnimationFrame(resizeToCurrentTab)
    window.addEventListener('resize', resizeToCurrentTab)
    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resizeToCurrentTab)
    }
  }, [])

  const hasApiKey = Boolean(apiKey)
  const isInteractionLocked = isLoading || isGameOver || isVictory
  const selectedTalents = useMemo(
    () => resolveSelectedTalents(talentSelection.choices, talentSelection.selectedIds),
    [talentSelection.choices, talentSelection.selectedIds],
  )
  const selectedTalentCount = selectedTalents.length

  const unreadPhoneCount = useMemo(
    () => phoneMessages.reduce((count, item) => count + (item.isRead ? 0 : 1), 0),
    [phoneMessages],
  )

  const clearSavedGame = useCallback(() => {
    safeRemoveFromStorage(GAME_SAVE_STORAGE)
  }, [])

  const saveGameState = useCallback(
    (overrides = {}) => {
      const isGameStarted = overrides.isGameStarted ?? hasStarted
      if (!isGameStarted) {
        return
      }

      const snapshotGameState = overrides.gameState ?? gameStateRef.current
      const snapshotHealthState = overrides.healthState ?? healthStateRef.current
      const snapshotMessages = overrides.messages ?? messagesRef.current
      const snapshotTalents = overrides.talents ?? talents

      const payload = {
        version: 1,
        savedAt: new Date().toISOString(),
        isGameStarted,
        day: snapshotGameState.day,
        eventsToday: overrides.eventsToday ?? eventsTodayRef.current,
        money: snapshotGameState.money,
        energy: snapshotGameState.energy,
        sanity: snapshotGameState.sanity,
        bossFavor: snapshotGameState.bossFavor,
        colleagueFavor: snapshotGameState.colleagueFavor,
        clientFavor: snapshotGameState.clientFavor,
        intelligence: snapshotGameState.wisdom,
        luck: snapshotGameState.luck,
        gameState: snapshotGameState,
        healthState: snapshotHealthState,
        activeDebuffs: snapshotHealthState,
        chatHistory: snapshotMessages,
        messages: snapshotMessages,
        phoneMessages: overrides.phoneMessages ?? phoneMessagesRef.current,
        inventory: overrides.inventory ?? inventoryRef.current,
        holdings: overrides.holdings ?? holdingsRef.current,
        marketPrices: overrides.marketPrices ?? marketPricesRef.current,
        pendingInvestments: overrides.pendingInvestments ?? pendingInvestmentsRef.current,
        sellerOffers: overrides.sellerOffers ?? sellerOffers,
        investmentRequest: overrides.investmentRequest ?? investmentRequest,
        investmentAmount: overrides.investmentAmount ?? investmentAmount,
        currentDailyTheme: overrides.currentDailyTheme ?? currentDailyThemeRef.current,
        activeEvent: overrides.activeEvent ?? activeEventRef.current,
        activeFactionInvite: overrides.activeFactionInvite ?? activeFactionInviteRef.current,
        currentOptions: overrides.currentOptions ?? currentOptions,
        dayMessageCandidates: overrides.dayMessageCandidates ?? dayMessageCandidatesRef.current,
        currentTalents: snapshotTalents,
        talents: snapshotTalents,
        maxEventsToday: overrides.maxEventsToday ?? maxEventsTodayRef.current,
        sideHustlesToday: overrides.sideHustlesToday ?? sideHustlesTodayRef.current,
        isAwaitingEndDay: overrides.isAwaitingEndDay ?? isAwaitingEndDayRef.current,
        endDayButtonText: overrides.endDayButtonText ?? endDayButtonText,
        scamRuin: overrides.scamRuin ?? scamRuinRef.current,
        isGameOver: false,
        isVictory: false,
      }

      safeWriteToStorage(GAME_SAVE_STORAGE, payload)
    },
    [
      currentOptions,
      endDayButtonText,
      hasStarted,
      investmentAmount,
      investmentRequest,
      currentDailyTheme,
      sellerOffers,
      talents,
    ],
  )

  const buildFreshRunPreview = useCallback(
    (nextSoulUpgrades = soulUpgrades) => {
      const nextTalentSelection = createTalentSelectionState(nextSoulUpgrades)
      const selectedForPreview = resolveSelectedTalents(
        nextTalentSelection.choices,
        nextTalentSelection.selectedIds,
      )

      return {
        nextTalentSelection,
        previewState: createInitialGameState(nextSoulUpgrades, selectedForPreview),
        previewTalents: selectedForPreview.map((item) => item.name),
      }
    },
    [soulUpgrades],
  )

  const resetRunState = useCallback(
    ({ clearSave = false } = {}) => {
      const { nextTalentSelection, previewState, previewTalents } = buildFreshRunPreview()
      const nextMaxEvents = rollMaxEventsToday()
      const nextDailyTheme = pickRandomDailyTheme(currentDailyThemeRef.current?.name || '')

      if (clearSave) {
        clearSavedGame()
      }

      if (nextEventTimerRef.current) {
        window.clearTimeout(nextEventTimerRef.current)
        nextEventTimerRef.current = null
      }

      setTalentSelection(nextTalentSelection)
      setGameState(previewState)
      gameStateRef.current = previewState
      setHealthState(initialHealthState)
      healthStateRef.current = initialHealthState
      setMessages(initialMessages)
      messagesRef.current = initialMessages
      setPhoneMessages([])
      phoneMessagesRef.current = []
      setPendingInvestments([])
      pendingInvestmentsRef.current = []
      setInvestmentRequest(null)
      commitActiveEvent(null)
      setInvestmentAmount(0)
      setCurrentDailyTheme(nextDailyTheme)
      currentDailyThemeRef.current = nextDailyTheme
      setLoadingText('')
      setCurrentOptions([])
      setActiveEvent(null)
      activeEventRef.current = null
      setActiveFactionInvite(null)
      activeFactionInviteRef.current = null
      setEventsToday(0)
      eventsTodayRef.current = 0
      setMaxEventsToday(nextMaxEvents)
      maxEventsTodayRef.current = nextMaxEvents
      setIsAwaitingEndDay(false)
      isAwaitingEndDayRef.current = false
      setEndDayButtonText(DEFAULT_END_DAY_BUTTON_TEXT)
      setSideHustlesToday(0)
      sideHustlesTodayRef.current = 0
      setIsLoading(false)
      setIsScreenShaking(false)
      setIsGameOver(false)
      setIsVictory(false)
      setVictoryText(DEFAULT_VICTORY_TEXT)
      setIsShopOpen(false)
      setIsMarketOpen(false)
      setIsSellerOpen(false)
      setIsBackpackOpen(false)
      setIsPhoneOpen(false)
      setShopErrorMessage('')
      setMarketErrorMessage('')
      setSellerErrorMessage('')
      setBackpackErrorMessage('')
      setMarketPrices(initialMarketPrices)
      marketPricesRef.current = initialMarketPrices
      setHoldings(initialHoldings)
      holdingsRef.current = initialHoldings
      setInventory([])
      inventoryRef.current = []
      setSellerOffers([])
      setToasts([])
      setIsSoulShopOpen(false)
      setIsAchievementsOpen(false)
      setEndgameSummary(null)
      setHasStarted(false)
      setTalents(previewTalents)
      setIsTutorialOpen(true)
      setPendingSavedGame(null)
      hasSettledRunRef.current = false
      scamRuinRef.current = false
      dayMessageCandidatesRef.current = []
      activeTabRef.current = 1
      setActiveTab(1)
    },
    [buildFreshRunPreview, clearSavedGame],
  )

  const applySavedGame = useCallback(
    (savedGame) => {
      if (!savedGame?.isGameStarted || !savedGame?.gameState) {
        clearSavedGame()
        setPendingSavedGame(null)
        return
      }

      const restoredHealthState = savedGame.healthState || savedGame.activeDebuffs || initialHealthState
      const restoredMessages = Array.isArray(savedGame.messages || savedGame.chatHistory)
        ? savedGame.messages || savedGame.chatHistory
        : initialMessages
      const restoredPhoneMessages = Array.isArray(savedGame.phoneMessages) ? savedGame.phoneMessages : []
      const restoredPendingInvestments = Array.isArray(savedGame.pendingInvestments) ? savedGame.pendingInvestments : []
      const restoredInventory = Array.isArray(savedGame.inventory) ? savedGame.inventory : []
      const restoredSellerOffers = Array.isArray(savedGame.sellerOffers) ? savedGame.sellerOffers : []
      const restoredTalents = Array.isArray(savedGame.talents || savedGame.currentTalents)
        ? savedGame.talents || savedGame.currentTalents
        : []
      const restoredCurrentOptions = Array.isArray(savedGame.currentOptions) ? savedGame.currentOptions : []
      const restoredEventsToday = Math.max(0, Number(savedGame.eventsToday) || 0)
      const fallbackNarrative =
        [...restoredMessages].reverse().find((item) => item?.role === 'system' && typeof item?.content === 'string')
          ?.content || '【系统】你上一次的打工回合还没做完。'
      const restoredActiveEvent =
        savedGame.activeEvent ||
        (restoredCurrentOptions.length
          ? createActiveEventSnapshot({
              narrative: fallbackNarrative,
              options: restoredCurrentOptions,
              source: 'local',
              mode: 'daily_workplace',
              specialEventType: 'normal',
              eventIndex: restoredEventsToday + 1,
            })
          : null)
      const restoredDayMessages = Array.isArray(savedGame.dayMessageCandidates) ? savedGame.dayMessageCandidates : []
      const restoredMaxEventsToday = Math.max(1, Number(savedGame.maxEventsToday) || rollMaxEventsToday())
      const restoredSideHustlesToday = Math.max(0, Number(savedGame.sideHustlesToday) || 0)
      const restoredInvestmentAmount = Math.max(0, Number(savedGame.investmentAmount) || 0)
      const restoredHoldings = savedGame.holdings || initialHoldings
      const restoredMarketPrices = savedGame.marketPrices || initialMarketPrices
      const restoredDailyTheme = savedGame.currentDailyTheme || pickRandomDailyTheme()

      if (nextEventTimerRef.current) {
        window.clearTimeout(nextEventTimerRef.current)
        nextEventTimerRef.current = null
      }

      setGameState(savedGame.gameState)
      gameStateRef.current = savedGame.gameState
      setHealthState(restoredHealthState)
      healthStateRef.current = restoredHealthState
      setMessages(restoredMessages)
      messagesRef.current = restoredMessages
      setPhoneMessages(restoredPhoneMessages)
      phoneMessagesRef.current = restoredPhoneMessages
      setPendingInvestments(restoredPendingInvestments)
      pendingInvestmentsRef.current = restoredPendingInvestments
      setInvestmentRequest(savedGame.investmentRequest || null)
      setInvestmentAmount(restoredInvestmentAmount)
      setCurrentDailyTheme(restoredDailyTheme)
      currentDailyThemeRef.current = restoredDailyTheme
      setLoadingText('')
      setCurrentOptions(restoredCurrentOptions)
      setActiveEvent(restoredActiveEvent)
      activeEventRef.current = restoredActiveEvent
      setActiveFactionInvite(savedGame.activeFactionInvite || null)
      activeFactionInviteRef.current = savedGame.activeFactionInvite || null
      setEventsToday(restoredEventsToday)
      eventsTodayRef.current = restoredEventsToday
      setMaxEventsToday(restoredMaxEventsToday)
      maxEventsTodayRef.current = restoredMaxEventsToday
      setIsAwaitingEndDay(Boolean(savedGame.isAwaitingEndDay))
      isAwaitingEndDayRef.current = Boolean(savedGame.isAwaitingEndDay)
      setEndDayButtonText(savedGame.endDayButtonText || DEFAULT_END_DAY_BUTTON_TEXT)
      setSideHustlesToday(restoredSideHustlesToday)
      sideHustlesTodayRef.current = restoredSideHustlesToday
      setIsLoading(false)
      setIsScreenShaking(false)
      setIsGameOver(false)
      setIsVictory(false)
      setVictoryText(savedGame.victoryText || DEFAULT_VICTORY_TEXT)
      setIsShopOpen(false)
      setIsMarketOpen(false)
      setIsSellerOpen(false)
      setIsBackpackOpen(false)
      setIsPhoneOpen(false)
      setShopErrorMessage('')
      setMarketErrorMessage('')
      setSellerErrorMessage('')
      setBackpackErrorMessage('')
      setMarketPrices(restoredMarketPrices)
      marketPricesRef.current = restoredMarketPrices
      setHoldings(restoredHoldings)
      holdingsRef.current = restoredHoldings
      setInventory(restoredInventory)
      inventoryRef.current = restoredInventory
      setSellerOffers(restoredSellerOffers)
      setIsSoulShopOpen(false)
      setIsAchievementsOpen(false)
      setEndgameSummary(null)
      setHasStarted(true)
      setTalents(restoredTalents)
      setIsTutorialOpen(false)
      setPendingSavedGame(null)
      hasSettledRunRef.current = false
      scamRuinRef.current = Boolean(savedGame.scamRuin)
      dayMessageCandidatesRef.current = restoredDayMessages
      activeTabRef.current = 1
      setActiveTab(1)
      setApiKeyStatus('已恢复本地自动存档。')
    },
    [clearSavedGame],
  )

  useEffect(() => {
    if (
      !isApiKeyBootstrapped ||
      isResumePromptOpen ||
      !hasStarted ||
      isTutorialOpen ||
      isLoading ||
      isGameOver ||
      isVictory ||
      endgameSummary
    ) {
      return
    }

    saveGameState()
  }, [
    activeFactionInvite,
    currentOptions,
    activeEvent,
    currentDailyTheme,
    endDayButtonText,
    endgameSummary,
    eventsToday,
    gameState,
    hasStarted,
    healthState,
    holdings,
    inventory,
    investmentAmount,
    investmentRequest,
    isApiKeyBootstrapped,
    isAwaitingEndDay,
    isGameOver,
    isLoading,
    isResumePromptOpen,
    isTutorialOpen,
    isVictory,
    marketPrices,
    messages,
    pendingInvestments,
    phoneMessages,
    saveGameState,
    sellerOffers,
    sideHustlesToday,
    talents,
    maxEventsToday,
  ])

  const pushToast = useCallback((message, type = 'info') => {
    const toastId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((prev) => [...prev, { id: toastId, message, type }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== toastId))
    }, 3000)
  }, [])

  const clearPendingNextEvent = useCallback(() => {
    if (nextEventTimerRef.current) {
      window.clearTimeout(nextEventTimerRef.current)
      nextEventTimerRef.current = null
    }
  }, [])

  const clearTransientErrors = useCallback(() => {
    setShopErrorMessage('')
    setMarketErrorMessage('')
    setSellerErrorMessage('')
    setBackpackErrorMessage('')
  }, [])

  const commitActiveEvent = useCallback((nextEvent) => {
    setActiveEvent(nextEvent)
    activeEventRef.current = nextEvent
  }, [])

  const handleToggleTalent = useCallback(
    (talentId) => {
      let reachedLimit = false
      setTalentSelection((prev) => {
        if (!prev.choices.some((item) => item.id === talentId)) {
          return prev
        }

        const isSelected = prev.selectedIds.includes(talentId)
        const isGoldenLocked = soulUpgrades.lockGoldenTalent && talentId === GOLDEN_TALENT_ID
        if (isSelected) {
          if (isGoldenLocked) {
            return prev
          }
          return {
            ...prev,
            selectedIds: prev.selectedIds.filter((id) => id !== talentId),
          }
        }

        if (prev.selectedIds.length >= TALENT_SELECT_REQUIRED) {
          reachedLimit = true
          return prev
        }

        return {
          ...prev,
          selectedIds: [...prev.selectedIds, talentId],
        }
      })

      if (reachedLimit) {
        pushToast(`最多只能选择 ${TALENT_SELECT_REQUIRED} 个天赋。`, 'warning')
      }
    },
    [pushToast, soulUpgrades.lockGoldenTalent],
  )

  const triggerScreenShake = useCallback(() => {
    setIsScreenShaking(true)
    if (shakeTimerRef.current) {
      window.clearTimeout(shakeTimerRef.current)
    }
    shakeTimerRef.current = window.setTimeout(() => {
      setIsScreenShaking(false)
    }, SHAKE_DURATION_MS)
  }, [])

  const appendSystemMessage = useCallback((content, changes) => {
    if (shouldTriggerShake(changes)) {
      triggerScreenShake()
    }
    setMessages((prev) => {
      const next = [...prev, createMessage('system', content, changes)]
      messagesRef.current = next
      return next
    })
  }, [triggerScreenShake])

  const finalizeRun = useCallback(
    ({ isVictoryRun, title, description, nextState, achievementIds = [] }) => {
      if (hasSettledRunRef.current) {
        return
      }
      hasSettledRunRef.current = true
      clearPendingNextEvent()
      clearSavedGame()

      const survivedDays = Math.max(1, nextState.day)
      const soulEarned = calculateSoulPointsReward(survivedDays, nextState.money)
      const nextSoulTotal = soulPointsRef.current + soulEarned
      setSoulPoints(nextSoulTotal)
      soulPointsRef.current = nextSoulTotal

      const prevUnlocked = unlockedAchievementsRef.current
      const uniqueAchievementIds = [...new Set(achievementIds)]
      const newlyUnlockedIds = uniqueAchievementIds.filter((id) => !prevUnlocked.includes(id))
      const mergedUnlocked = [...new Set([...prevUnlocked, ...uniqueAchievementIds])]
      if (mergedUnlocked.length !== prevUnlocked.length) {
        setUnlockedAchievements(mergedUnlocked)
        unlockedAchievementsRef.current = mergedUnlocked
      }
      if (newlyUnlockedIds.length) {
        pushToast(`解锁成就：${newlyUnlockedIds.map((id) => getAchievementTitleById(id)).join('、')}`, 'info')
      }

      setEndgameSummary({
        isVictory: isVictoryRun,
        title,
        description,
        survivedDays,
        finalMoney: nextState.money,
        soulEarned,
        soulTotal: nextSoulTotal,
        unlockedTitles: newlyUnlockedIds.map((id) => getAchievementTitleById(id)),
      })
    },
    [clearPendingNextEvent, clearSavedGame, pushToast],
  )

  const appendPhoneMessages = useCallback(
    (incomingMessages, day) => {
      const validMessages = normalizePhoneMessages(incomingMessages)
      if (!validMessages.length) {
        return
      }

      const currentWisdom = gameStateRef.current.wisdom

      setPhoneMessages((prev) => {
        const next = [...prev, ...validMessages.map((item) => createPhoneInboxMessage(item, day, currentWisdom))]
        phoneMessagesRef.current = next
        return next
      })
      pushToast(`手机收到 ${validMessages.length} 条新消息。`, 'info')
    },
    [pushToast],
  )

  const resolveTerminalState = useCallback(
    (nextState, nextHealthState = healthStateRef.current) => {
      const closeRunPanels = () => {
        clearPendingNextEvent()
        setIsShopOpen(false)
        setIsMarketOpen(false)
        setIsSellerOpen(false)
        setIsBackpackOpen(false)
        setIsPhoneOpen(false)
        setIsSoulShopOpen(false)
        setIsAchievementsOpen(false)
        setInvestmentRequest(null)
        setCurrentOptions([])
        commitActiveEvent(null)
      }

      if (nextHealthState.sick && nextHealthState.depressed && nextHealthState.dualDebuffDays > 3) {
        setIsGameOver(true)
        closeRunPanels()
        appendSystemMessage(
          '【系统】Game Over：在长期的病痛与极度抑郁中，你选择在一个深夜从天台一跃而下……',
        )
        finalizeRun({
          isVictoryRun: false,
          title: 'Game Over：病痛与抑郁的尽头',
          description: '长期的身心双重崩溃让你彻底失去支撑，故事在天台终止。',
          nextState,
          achievementIds: ['rooftop_regular'],
        })
        return
      }

      const totalAssetValue =
        nextState.money + getPortfolioMarketValue(holdingsRef.current, marketPricesRef.current)

      if (nextState.money < 0 || totalAssetValue <= 0) {
        setIsGameOver(true)
        closeRunPanels()
        appendSystemMessage('【系统】Game Over：资金链断裂，你彻底破产了。')

        const achievementIds = []
        const hasMarketExposure = Object.values(holdingsRef.current).some((amount) => amount > 0)
        if (hasMarketExposure) {
          achievementIds.push('a_share_lamp')
        }
        if (scamRuinRef.current && nextState.money <= 0) {
          achievementIds.push('anti_fraud_shame')
        }

        finalizeRun({
          isVictoryRun: false,
          title: 'Game Over：资金链断裂',
          description: '你的现金流彻底崩盘，办公室工位和梦想一起被回收。',
          nextState,
          achievementIds,
        })
        return
      }

      const gameOverReason = getGameOverReason(nextState)
      if (gameOverReason) {
        setIsGameOver(true)
        closeRunPanels()
        appendSystemMessage(`【系统】Game Over：${gameOverReason}`)
        finalizeRun({
          isVictoryRun: false,
          title: 'Game Over：职场生存失败',
          description: gameOverReason,
          nextState,
          achievementIds: [],
        })
        return
      }

      if (totalAssetValue >= RICH_WIN_TARGET) {
        setIsVictory(true)
        setVictoryText('【恭喜你，资产突破 50,000，提前财富自由光荣退休！】')
        closeRunPanels()
        appendSystemMessage('【系统】你资产突破 $50,000，提前实现财富自由，潇洒离场！')
        finalizeRun({
          isVictoryRun: true,
          title: '提前退休',
          description: '你在资本游戏里杀出重围，提前离开了这座格子间炼狱。',
          nextState,
          achievementIds: ['early_retire'],
        })
        return
      }

      if (nextState.day >= WIN_DAY) {
        setIsVictory(true)
        setVictoryText('【恭喜你，熬过了30天，成功拿着N+1赔偿金光荣退休！】')
        closeRunPanels()
        appendSystemMessage('【系统】你成功熬过了 30 天，终于拿到了 N+1。')

        const achievementIds = nextState.money < 1000 ? ['capital_son'] : []
        finalizeRun({
          isVictoryRun: true,
          title: '熬满 30 天',
          description: '你硬生生把试炼扛满了整整 30 天，终于拿到了离场资格。',
          nextState,
          achievementIds,
        })
      }
    },
    [appendSystemMessage, clearPendingNextEvent, commitActiveEvent, finalizeRun],
  )

  const applyDailyMaintenance = useCallback(
    (inputState, options = {}) => {
      const { sourceMessages = [], baseHealthState = healthStateRef.current, skipAfflictionCheck = false } = options

      let nextState = { ...inputState }

      const nextMarketPrices = refreshMarketPrices(marketPricesRef.current, nextState.luck)
      const { nextInventory, brokenItems } = decayInventory(inventoryRef.current)
      const { resolved, nextPending, totalPayout } = settlePendingInvestments(
        pendingInvestmentsRef.current,
        nextState.day,
      )

      if (totalPayout !== 0) {
        nextState = {
          ...nextState,
          money: roundToCents(nextState.money + totalPayout),
        }
      }

      const hasScamLoss = resolved.some((item) => !item.isSuccess && item.payout <= item.amount * 0.1)
      if (hasScamLoss && nextState.money <= 0) {
        scamRuinRef.current = true
      }

      const { nextHealthState, events } = evaluateHealthAfterDay(baseHealthState, nextState, { skipAfflictionCheck })

      const aiPhoneMessages = normalizePhoneMessages(
        Array.isArray(sourceMessages) ? sourceMessages.slice(-3) : [],
      )
      const localPhoneMessages = generateDailyPhoneMessages(nextState.luck)
      const optionalCandidates = [...aiPhoneMessages, ...localPhoneMessages]
      const hasResolvedInvestment = resolved.length > 0
      const resolvedInvestmentMessage = hasResolvedInvestment
        ? {
            sender: '投资平台通知',
            content:
              resolved.length === 1
                ? `你参与的「${resolved[0].projectName}」已结算，回款 $${resolved[0].payout.toFixed(2)}。`
                : `你有 ${resolved.length} 笔投资本日结算，合计回款 $${totalPayout.toFixed(2)}。`,
            isTrue: true,
          }
        : null

      const incomingPhoneMessages = []
      if (resolvedInvestmentMessage) {
        incomingPhoneMessages.push(resolvedInvestmentMessage)
      } else if (aiPhoneMessages.length === 3) {
        incomingPhoneMessages.push(...aiPhoneMessages)
      } else if (optionalCandidates.length && Math.random() < PHONE_MESSAGE_TRIGGER_RATE) {
        const picked = optionalCandidates[randomInt(0, optionalCandidates.length - 1)]
        if (picked) {
          incomingPhoneMessages.push(picked)
        }
      }

      setMarketPrices(nextMarketPrices)
      marketPricesRef.current = nextMarketPrices
      setInventory(nextInventory)
      inventoryRef.current = nextInventory
      setPendingInvestments(nextPending)
      pendingInvestmentsRef.current = nextPending
      setHealthState(nextHealthState)
      healthStateRef.current = nextHealthState
      setGameState(nextState)
      gameStateRef.current = nextState

      appendPhoneMessages(incomingPhoneMessages, nextState.day)

      if (brokenItems.length) {
        brokenItems.forEach((item) => {
          pushToast(`道具损坏：${item.name} 耐久归零，已自动移除。`, 'warning')
        })
      }

      if (events.length) {
        events.forEach((content) => {
          appendSystemMessage(`【系统】${content}`)
          pushToast(content, 'warning')
        })
      }

      if (resolved.length) {
        appendSystemMessage(
          resolved.length === 1
            ? `【系统】投资项目「${resolved[0].projectName}」到账 $${resolved[0].payout.toFixed(2)}。`
            : `【系统】有 ${resolved.length} 笔投资到账，总计 $${totalPayout.toFixed(2)}。`,
          createChangePayload({ moneyChange: totalPayout }),
        )
      }

      return { nextState, nextHealthState }
    },
    [appendPhoneMessages, appendSystemMessage, pushToast],
  )

  const handleSaveApiKey = () => {
    const nextKey = apiKeyInput.trim()
    if (!nextKey) {
      window.localStorage.removeItem(API_KEY_STORAGE)
      setApiKey('')
      setHasStarted(false)
      clearPendingNextEvent()
      setCurrentOptions([])
      commitActiveEvent(null)
      setIsAwaitingEndDay(false)
      setEndDayButtonText('🌙 终于熬到头了，打卡下班！')
      setInvestmentRequest(null)
      dayMessageCandidatesRef.current = []
      setApiKeyStatus('API Key 已清除。')
      return
    }

    window.localStorage.setItem(API_KEY_STORAGE, nextKey)
    setApiKey(nextKey)
    setHasStarted(false)
    clearPendingNextEvent()
    commitActiveEvent(null)
    dayMessageCandidatesRef.current = []
    setApiKeyStatus('API Key 已保存到 localStorage。')
    scrollToMobileTab(1)
  }

  const presentGeneratedEvent = useCallback(
    ({
      narrative,
      options,
      source = 'local',
      mode = 'daily_workplace',
      specialEventType = 'normal',
      requireInvestmentInput = false,
      eventIndex = 1,
    }) => {
      const shuffledOptions = shuffleArray(options)
      const nextEvent = createActiveEventSnapshot({
        narrative,
        options: shuffledOptions,
        source,
        mode,
        specialEventType,
        requireInvestmentInput,
        eventIndex,
      })

      commitActiveEvent(nextEvent)
      appendSystemMessage(narrative)

      if (requireInvestmentInput || mode === 'investment_pitch') {
        const maxAmount = Math.max(0, Math.floor(gameStateRef.current.money))
        setInvestmentRequest({
          maxAmount,
          suggestedOptions: shuffledOptions,
          endDayAfterResolve: false,
        })
        setInvestmentAmount(Math.min(maxAmount, 100))
        setCurrentOptions([])
        appendSystemMessage('【系统】对方要求你立刻输入投资金额，请谨慎决策。')
        return nextEvent
      }

      setInvestmentRequest(null)
      setCurrentOptions(shuffledOptions)
      return nextEvent
    },
    [appendSystemMessage, commitActiveEvent],
  )

  const generateNextEvent = useCallback(
    async (specialEventType = 'normal', options = {}) => {
      const { bypassLock = false, eventIndexOverride = null, maxEventsOverride = null } = options
      if (!hasApiKey || (!bypassLock && isInteractionLocked)) {
        return
      }

      clearPendingNextEvent()
      clearTransientErrors()
      setInvestmentRequest(null)
      setCurrentOptions([])
      setIsAwaitingEndDay(false)
      isAwaitingEndDayRef.current = false
      setEndDayButtonText(DEFAULT_END_DAY_BUTTON_TEXT)
      setActiveFactionInvite(null)
      activeFactionInviteRef.current = null

      const eventIndex = Math.max(1, eventIndexOverride ?? eventsTodayRef.current + 1)
      const maxEventsForPrompt = Math.max(1, maxEventsOverride ?? maxEventsTodayRef.current)

      if (specialEventType === 'seller') {
        const offers = generateSellerOffers()
        setSellerOffers(offers)
        setIsSellerOpen(true)
        presentGeneratedEvent({
          narrative: '【系统】你刚到工位，神秘推销商就从打印机后面闪现出来，堵住了你的去路。',
          options: SELLER_FOLLOWUP_OPTIONS,
          source: 'local',
          mode: 'seller',
          specialEventType,
          eventIndex,
        })
        return
      }

      if (specialEventType === 'faction_invite') {
        const inviteEvent = createFactionInviteEvent(gameStateRef.current.faction)
        setActiveFactionInvite(inviteEvent)
        activeFactionInviteRef.current = inviteEvent
        presentGeneratedEvent({
          narrative: inviteEvent.narrative,
          options: inviteEvent.options,
          source: 'local',
          mode: 'faction_invite',
          specialEventType,
          eventIndex,
        })
        return
      }

      if (specialEventType === 'normal' && randomInt(1, 100) > AI_NEXT_EVENT_RATE) {
        const localEvent = pickRandomLocalEvent()
        presentGeneratedEvent({
          ...localEvent,
          source: 'local',
          mode: 'daily_workplace',
          specialEventType,
          eventIndex,
        })
        return
      }

      const mode =
        specialEventType === 'fortune_teller'
          ? 'fortune_teller'
          : specialEventType === 'investment_pitch'
            ? 'investment_pitch'
            : 'daily_workplace'

      setIsLoading(true)

      try {
        const turnResult = await requestDeepSeekTurn({
          apiKey,
          playerInput: GAME_START_COMMAND,
          gameState: gameStateRef.current,
          history: messagesRef.current,
          talents,
          inventory: inventoryRef.current,
          dailyTheme: currentDailyThemeRef.current,
          mode,
          intraDayContext: {
            eventIndex,
            maxEventsToday: maxEventsForPrompt,
            period: getIntraDayPeriod(eventIndex, maxEventsForPrompt),
          },
        })

        if (turnResult.messages.length) {
          dayMessageCandidatesRef.current = [
            ...dayMessageCandidatesRef.current,
            ...turnResult.messages,
          ].slice(-8)
        }

        presentGeneratedEvent({
          narrative: turnResult.narrative,
          options: turnResult.options,
          source: 'ai',
          mode,
          specialEventType,
          requireInvestmentInput: turnResult.requireInvestmentInput || mode === 'investment_pitch',
          eventIndex,
        })
      } catch (error) {
        appendSystemMessage(`【系统】${error.message || 'AI 出题失败，已切换到本地事件池。'}`)
        const localEvent = pickRandomLocalEvent()
        presentGeneratedEvent({
          ...localEvent,
          source: 'local',
          mode: 'daily_workplace',
          specialEventType: 'normal',
          eventIndex,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [
      apiKey,
      appendSystemMessage,
      clearPendingNextEvent,
      clearTransientErrors,
      hasApiKey,
      isInteractionLocked,
      presentGeneratedEvent,
      talents,
    ],
  )

  const scheduleNextWorkEvent = useCallback(() => {
    clearPendingNextEvent()
    nextEventTimerRef.current = window.setTimeout(() => {
      nextEventTimerRef.current = null
      void generateNextEvent('normal', { bypassLock: true })
    }, NEXT_EVENT_DELAY_MS)
  }, [clearPendingNextEvent, generateNextEvent])

  const applyResolutionResult = useCallback(
    (resolutionResult) => {
      const nextTurnState = applyEventStatChanges(gameStateRef.current, resolutionResult.statChanges)
      setGameState(nextTurnState)
      gameStateRef.current = nextTurnState

      appendSystemMessage(
        resolutionResult.narrative,
        createChangePayload({
          moneyChange: resolutionResult.statChanges.money,
          energyChange: resolutionResult.statChanges.energy,
          sanityChange: resolutionResult.statChanges.sanity,
          bossFavorChange: resolutionResult.statChanges.bossFavor,
          colleagueFavorChange: resolutionResult.statChanges.colleagueFavor,
          clientFavorChange: resolutionResult.statChanges.clientFavor,
        }),
      )

      commitActiveEvent(null)
      setInvestmentRequest(null)
      setCurrentOptions([])

      const nextEventsToday = eventsTodayRef.current + 1
      setEventsToday(nextEventsToday)
      eventsTodayRef.current = nextEventsToday

      resolveTerminalState(nextTurnState, healthStateRef.current)

      if (isRunTerminal(nextTurnState, healthStateRef.current, holdingsRef.current, marketPricesRef.current)) {
        return
      }

      if (nextEventsToday >= maxEventsTodayRef.current) {
        setIsAwaitingEndDay(true)
        isAwaitingEndDayRef.current = true
        setEndDayButtonText(DEFAULT_END_DAY_BUTTON_TEXT)
        appendSystemMessage(
          `【系统】今天的事件已经处理完毕（${nextEventsToday}/${maxEventsTodayRef.current}），可以打卡下班了。`,
        )
        return
      }

      scheduleNextWorkEvent()
    },
    [appendSystemMessage, commitActiveEvent, resolveTerminalState, scheduleNextWorkEvent],
  )

  const resolveCurrentEvent = useCallback(
    async (optionText) => {
      const currentEvent = activeEventRef.current
      const trimmedOption = optionText.trim()

      if (!currentEvent || !trimmedOption || !hasApiKey || isInteractionLocked) {
        return
      }

      clearPendingNextEvent()
      clearTransientErrors()

      const playerMessage = createMessage('player', trimmedOption)
      const historyForTurn = [...messagesRef.current, playerMessage]
      messagesRef.current = historyForTurn
      setMessages(historyForTurn)
      setIsLoading(true)

      try {
        const resolutionResult = await requestDeepSeekResolution({
          apiKey,
          eventNarrative: currentEvent.narrative,
          selectedOption: trimmedOption,
          gameState: gameStateRef.current,
          history: historyForTurn,
          talents,
          inventory: inventoryRef.current,
          dailyTheme: currentDailyThemeRef.current,
        })

        applyResolutionResult(resolutionResult)
      } catch (error) {
        appendSystemMessage(`【系统】${error.message || 'AI 判卷失败，本回合按险过处理。'}`)
        applyResolutionResult({
          narrative: '【系统】AI 判卷暂时宕机，你先硬着头皮把这回合混过去了。',
          statChanges: {
            money: 0,
            energy: 0,
            sanity: 0,
            bossFavor: 0,
            colleagueFavor: 0,
            clientFavor: 0,
          },
        })
      } finally {
        setIsLoading(false)
      }
    },
    [
      apiKey,
      appendSystemMessage,
      applyResolutionResult,
      clearPendingNextEvent,
      clearTransientErrors,
      hasApiKey,
      isInteractionLocked,
      talents,
    ],
  )

  const runPlayerTurn = useCallback(
    async (rawAction, options = {}) => {
      const {
        showPlayerMessage = true,
        isOpeningScene = false,
        modeOverride = 'daily_workplace',
        bypassLock = false,
        eventIndexOverride = null,
        maxEventsOverride = null,
      } = options
      const playerInput = rawAction.trim()
      if (!playerInput || !hasApiKey || (!bypassLock && isInteractionLocked)) {
        return
      }

      let historyForTurn = messagesRef.current

      if (showPlayerMessage) {
        const playerMessage = createMessage('player', playerInput)
        historyForTurn = [...messagesRef.current, playerMessage]
        messagesRef.current = historyForTurn
        setMessages(historyForTurn)
      }

      setShopErrorMessage('')
      setMarketErrorMessage('')
      setSellerErrorMessage('')
      setBackpackErrorMessage('')
      if (activeFactionInviteRef.current) {
        setActiveFactionInvite(null)
        activeFactionInviteRef.current = null
      }
      if (!isOpeningScene) {
        setCurrentOptions([])
      }
      setIsLoading(true)

      try {
        const eventIndex = Math.max(1, eventIndexOverride ?? eventsTodayRef.current + 1)
        const maxEventsForPrompt = Math.max(1, maxEventsOverride ?? maxEventsTodayRef.current)
        const stateForTurn = gameStateRef.current

        const turnResult = await requestDeepSeekTurn({
          apiKey,
          playerInput,
          gameState: stateForTurn,
          history: historyForTurn,
          talents,
          inventory: inventoryRef.current,
          dailyTheme: currentDailyThemeRef.current,
          mode: modeOverride,
          intraDayContext: {
            eventIndex,
            maxEventsToday: maxEventsForPrompt,
            period: getIntraDayPeriod(eventIndex, maxEventsForPrompt),
          },
        })

        if (turnResult.messages.length) {
          dayMessageCandidatesRef.current = [
            ...dayMessageCandidatesRef.current,
            ...turnResult.messages,
          ].slice(-8)
        }
        const shuffledTurnOptions = shuffleArray(turnResult.options)

        if (isOpeningScene) {
          appendSystemMessage(turnResult.narrative)
          const openingRequireInvestmentInput =
            turnResult.requireInvestmentInput || modeOverride === 'investment_pitch'
          if (openingRequireInvestmentInput) {
            const maxAmount = Math.max(0, Math.floor(stateForTurn.money))
            setInvestmentRequest({
              maxAmount,
              suggestedOptions: shuffledTurnOptions,
              endDayAfterResolve: false,
            })
            setInvestmentAmount(Math.min(maxAmount, 100))
            setCurrentOptions([])
            appendSystemMessage('【系统】对方要求你立即输入投资金额，请谨慎决策。')
          } else {
            setInvestmentRequest(null)
            setCurrentOptions(shuffledTurnOptions)
          }
          return
        }

        const nextTurnState = applyEventStatChanges(stateForTurn, turnResult.statChanges)
        setGameState(nextTurnState)
        gameStateRef.current = nextTurnState

        appendSystemMessage(
          turnResult.narrative,
          createChangePayload({
            moneyChange: turnResult.statChanges.money,
            energyChange: turnResult.statChanges.energy,
            sanityChange: turnResult.statChanges.sanity,
            bossFavorChange: turnResult.statChanges.bossFavor,
            colleagueFavorChange: turnResult.statChanges.colleagueFavor,
            clientFavorChange: turnResult.statChanges.clientFavor,
          }),
        )

        const requireInvestmentInput =
          turnResult.requireInvestmentInput || modeOverride === 'investment_pitch'
        const nextEventsToday = eventsTodayRef.current + 1
        const shouldEndDay = nextEventsToday >= maxEventsTodayRef.current

        setEventsToday(nextEventsToday)
        eventsTodayRef.current = nextEventsToday

        if (requireInvestmentInput) {
          const maxAmount = Math.max(0, Math.floor(nextTurnState.money))
          setInvestmentRequest({
            maxAmount,
            suggestedOptions: shuffledTurnOptions,
            endDayAfterResolve: shouldEndDay,
          })
          setInvestmentAmount(Math.min(maxAmount, 100))
          setCurrentOptions([])
          appendSystemMessage('【系统】对方要求你立即输入投资金额，请谨慎决策。')
        } else if (shouldEndDay) {
          setInvestmentRequest(null)
          setCurrentOptions([])
          setIsAwaitingEndDay(true)
          isAwaitingEndDayRef.current = true
          setEndDayButtonText('🌙 终于熬到头了，打卡下班！')
          appendSystemMessage(
            `【系统】今天的事件已处理完（${nextEventsToday}/${maxEventsTodayRef.current}），可以打卡下班了。`,
          )
        } else {
          setInvestmentRequest(null)
          setCurrentOptions(shuffledTurnOptions)
        }

        resolveTerminalState(nextTurnState, healthStateRef.current)
      } catch (error) {
        appendSystemMessage(`【系统】${error.message || 'AI 调用失败，请稍后再试。'}`)
      } finally {
        setIsLoading(false)
      }
    },
    [
      apiKey,
      appendSystemMessage,
      hasApiKey,
      isInteractionLocked,
      resolveTerminalState,
      talents,
    ],
  )

  const startDayOpeningEvent = useCallback(
    async (specialEventType = 'normal') => {
      if (!hasApiKey) {
        return
      }

      setIsAwaitingEndDay(false)
      isAwaitingEndDayRef.current = false
      setEndDayButtonText('🌙 终于熬到头了，打卡下班！')
      setActiveFactionInvite(null)
      activeFactionInviteRef.current = null

      if (specialEventType === 'seller') {
        const offers = generateSellerOffers()
        setSellerOffers(offers)
        setIsSellerOpen(true)
        setCurrentOptions(SELLER_FOLLOWUP_OPTIONS)
        appendSystemMessage('【系统】你刚到工位，神秘推销商突然挡住了你的去路。')
        return
      }

      if (specialEventType === 'faction_invite') {
        const inviteEvent = createFactionInviteEvent(gameStateRef.current.faction)
        setActiveFactionInvite(inviteEvent)
        activeFactionInviteRef.current = inviteEvent
        setCurrentOptions(inviteEvent.options)
        appendSystemMessage(inviteEvent.narrative)
        return
      }

      const mode =
        specialEventType === 'fortune_teller'
          ? 'fortune_teller'
          : specialEventType === 'investment_pitch'
            ? 'investment_pitch'
            : 'daily_workplace'

      await runPlayerTurn(GAME_START_COMMAND, {
        showPlayerMessage: false,
        isOpeningScene: true,
        modeOverride: mode,
        bypassLock: true,
        eventIndexOverride: 1,
      })
    },
    [appendSystemMessage, hasApiKey, runPlayerTurn],
  )

  const handleEndDay = useCallback(async () => {
    if (!hasApiKey || isInteractionLocked || !isAwaitingEndDayRef.current) {
      return
    }

    clearPendingNextEvent()
    clearTransientErrors()
    setCurrentOptions([])
    setInvestmentRequest(null)
    commitActiveEvent(null)
    setIsLoading(true)

    try {
      const wasHospitalizing = healthStateRef.current.hospitalTurnsRemaining > 0
      const salarySettlement = wasHospitalizing
        ? { salaryGain: 0, deductedAmount: 0, reason: null, deductionRate: 0 }
        : rollSalaryWithCapitalistClawback(DAILY_SALARY)
      const salaryGain = salarySettlement.salaryGain
      const nextDayBaseState = {
        ...gameStateRef.current,
        day: gameStateRef.current.day + 1,
        luck: rollDailyLuck(),
        money: roundToCents(gameStateRef.current.money + salaryGain),
      }

      if (!wasHospitalizing && salarySettlement.deductedAmount > 0) {
        const deductionPercent = Math.round(salarySettlement.deductionRate * 100)
        appendSystemMessage(
          `【资本家吸血】老板以「${salarySettlement.reason}」为由，当场克扣了你 ${deductionPercent}% 的工资（-$${salarySettlement.deductedAmount.toFixed(
            2,
          )}）。今日实发：$${salaryGain.toFixed(2)}。`,
          createChangePayload({ moneyChange: salaryGain }),
        )
      } else if (salaryGain > 0) {
        appendSystemMessage(
          `【每日结算】辛苦打工一天，获得日薪 $${DAILY_SALARY}。`,
          createChangePayload({ moneyChange: DAILY_SALARY }),
        )
      } else {
        appendSystemMessage('【每日结算】你仍在住院休养，今天不发工资。')
      }

      const preHealthState = wasHospitalizing
        ? {
            ...healthStateRef.current,
            hospitalTurnsRemaining: Math.max(0, healthStateRef.current.hospitalTurnsRemaining - 1),
          }
        : healthStateRef.current

      const { nextState, nextHealthState } = applyDailyMaintenance(nextDayBaseState, {
        sourceMessages: dayMessageCandidatesRef.current,
        baseHealthState: preHealthState,
        skipAfflictionCheck: wasHospitalizing,
      })
      const nextDailyTheme = pickRandomDailyTheme(currentDailyThemeRef.current?.name || '')

      dayMessageCandidatesRef.current = []
      setCurrentDailyTheme(nextDailyTheme)
      currentDailyThemeRef.current = nextDailyTheme
      setEventsToday(0)
      eventsTodayRef.current = 0
      const nextMaxEvents = rollMaxEventsToday()
      setMaxEventsToday(nextMaxEvents)
      maxEventsTodayRef.current = nextMaxEvents
      setSideHustlesToday(0)
      sideHustlesTodayRef.current = 0
      setIsAwaitingEndDay(false)
      isAwaitingEndDayRef.current = false
      setEndDayButtonText('🌙 终于熬到头了，打卡下班！')

      resolveTerminalState(nextState, nextHealthState)

      const totalAssetValue =
        nextState.money + getPortfolioMarketValue(holdingsRef.current, marketPricesRef.current)
      const isTerminal =
        (nextHealthState.sick && nextHealthState.depressed && nextHealthState.dualDebuffDays > 3) ||
        nextState.money < 0 ||
        totalAssetValue <= 0 ||
        Boolean(getGameOverReason(nextState)) ||
        totalAssetValue >= RICH_WIN_TARGET ||
        nextState.day >= WIN_DAY

      if (isTerminal) {
        return
      }

      if (nextHealthState.hospitalTurnsRemaining > 0) {
        setIsAwaitingEndDay(true)
        isAwaitingEndDayRef.current = true
        setEndDayButtonText('🏥 住院中，继续休养一天')
        appendSystemMessage(
          `【系统】住院治疗进行中，今天继续休养。剩余住院天数：${nextHealthState.hospitalTurnsRemaining}。`,
        )
        return
      }

      const specialEventType = rollSpecialEventType()
      await generateNextEvent(specialEventType, {
        bypassLock: true,
        eventIndexOverride: 1,
      })
    } finally {
      setIsLoading(false)
    }
  }, [
    appendSystemMessage,
    applyDailyMaintenance,
    clearPendingNextEvent,
    clearTransientErrors,
    commitActiveEvent,
    generateNextEvent,
    hasApiKey,
    isInteractionLocked,
    resolveTerminalState,
  ])

  useEffect(() => {
    if (
      !hasApiKey ||
      hasStarted ||
      isInteractionLocked ||
      isTutorialOpen ||
      currentOptions.length > 0 ||
      investmentRequest
    ) {
      return
    }

    setHasStarted(true)
    void generateNextEvent(rollSpecialEventType(), {
      bypassLock: true,
      eventIndexOverride: 1,
    })
  }, [
    currentOptions.length,
    hasApiKey,
    hasStarted,
    investmentRequest,
    isInteractionLocked,
    isTutorialOpen,
    generateNextEvent,
  ])

  const applyFactionInviteChoice = useCallback(
    (optionText) => {
      const invite = activeFactionInviteRef.current
      if (!invite || !invite.options.includes(optionText)) {
        return false
      }

      if (optionText === invite.joinOption) {
        const nextState = {
          ...gameStateRef.current,
          faction: invite.targetFaction,
        }
        setGameState(nextState)
        gameStateRef.current = nextState
        appendSystemMessage(`【帮派暗线】你正式加入了「${invite.targetFaction}」，从今天开始你有组织了。`)
      } else {
        appendSystemMessage('【帮派暗线】你把纸条揉成一团塞进兜里，决定先继续保持中立。')
      }

      setActiveFactionInvite(null)
      activeFactionInviteRef.current = null
      return true
    },
    [appendSystemMessage],
  )

  const handleSelectOption = (optionText) => {
    if (investmentRequest || isAwaitingEndDayRef.current) {
      return
    }

    applyFactionInviteChoice(optionText)
    void resolveCurrentEvent(optionText)
  }

  const handleSideHustle = () => {
    if (
      !hasApiKey ||
      isInteractionLocked ||
      investmentRequest ||
      isAwaitingEndDayRef.current ||
      sideHustlesTodayRef.current >= SIDE_HUSTLE_LIMIT_PER_DAY
    ) {
      if (sideHustlesTodayRef.current >= SIDE_HUSTLE_LIMIT_PER_DAY) {
        appendSystemMessage('【系统】今天私活额度已用完（最多 2 次），先把正事熬完再说。')
      }
      return
    }

    const gotCaught = Math.random() < SIDE_HUSTLE_BUST_RATE
    const reward = gotCaught ? 0 : randomInt(SIDE_HUSTLE_MIN_REWARD, SIDE_HUSTLE_MAX_REWARD)
    const moneyDelta = gotCaught ? -SIDE_HUSTLE_BUST_FINE : reward
    const nextBossFavor = gotCaught
      ? clampStat(gameStateRef.current.bossFavor - SIDE_HUSTLE_BOSS_PENALTY)
      : gameStateRef.current.bossFavor

    const nextState = {
      ...gameStateRef.current,
      money: roundToCents(gameStateRef.current.money + moneyDelta),
      energy: clampStat(gameStateRef.current.energy - SIDE_HUSTLE_ENERGY_COST),
      sanity: clampStat(gameStateRef.current.sanity - SIDE_HUSTLE_SANITY_COST),
      bossFavor: nextBossFavor,
    }
    const nextCount = sideHustlesTodayRef.current + 1

    setGameState(nextState)
    gameStateRef.current = nextState
    setSideHustlesToday(nextCount)
    sideHustlesTodayRef.current = nextCount

    if (gotCaught) {
      appendSystemMessage(
        '【老板查岗】你在工位上切屏慢了，被老板当场逮住干私活！当月绩效扣除 $500，老板对你极其失望！',
        createChangePayload({
          moneyChange: -SIDE_HUSTLE_BUST_FINE,
          energyChange: -SIDE_HUSTLE_ENERGY_COST,
          sanityChange: -SIDE_HUSTLE_SANITY_COST,
          bossFavorChange: -SIDE_HUSTLE_BOSS_PENALTY,
        }),
      )
      pushToast('老板查岗：你被抓包了，绩效被重罚！', 'warning')
    } else {
      appendSystemMessage(
        `【外包结账】你熬夜给外面的客户写了套代码，狂赚 $${reward}！`,
        createChangePayload({
          moneyChange: reward,
          energyChange: -SIDE_HUSTLE_ENERGY_COST,
          sanityChange: -SIDE_HUSTLE_SANITY_COST,
        }),
      )
    }
    resolveTerminalState(nextState, healthStateRef.current)
  }

  const handleOpenSoulShop = () => {
    setIsSoulShopOpen(true)
  }

  const handleCloseSoulShop = () => {
    setIsSoulShopOpen(false)
  }

  const handleOpenAchievements = () => {
    setIsAchievementsOpen(true)
  }

  const handleCloseAchievements = () => {
    setIsAchievementsOpen(false)
  }

  const handleCheatAddSoul = () => {
    const nextSoul = soulPointsRef.current + 1000
    setSoulPoints(nextSoul)
    soulPointsRef.current = nextSoul
    pushToast('开发模式：打工魂 +1000', 'info')
  }

  const handlePurchaseSoulUpgrade = (upgradeId) => {
    const costMap = {
      starterCashBoost: 500,
      lockGoldenTalent: 1000,
    }
    const cost = costMap[upgradeId]
    if (!cost) {
      return
    }
    if (soulUpgrades[upgradeId]) {
      pushToast('该永久增益已拥有。', 'warning')
      return
    }
    if (soulPointsRef.current < cost) {
      pushToast('打工魂不足，先去多死几次再来。', 'warning')
      return
    }

    const nextSoul = soulPointsRef.current - cost
    const nextUpgrades = {
      ...soulUpgrades,
      [upgradeId]: true,
    }

    setSoulPoints(nextSoul)
    soulPointsRef.current = nextSoul
    setSoulUpgrades(nextUpgrades)
    pushToast('永久增益购买成功，下次开局生效。', 'info')

    if (!hasStarted) {
      const nextTalentSelection = createTalentSelectionState(nextUpgrades)
      const selectedForPreview = resolveSelectedTalents(
        nextTalentSelection.choices,
        nextTalentSelection.selectedIds,
      )
      const upgradedState = createInitialGameState(nextUpgrades, selectedForPreview)
      const upgradedTalents = selectedForPreview.map((item) => item.name)
      setTalentSelection(nextTalentSelection)
      setGameState(upgradedState)
      gameStateRef.current = upgradedState
      setTalents(upgradedTalents)
    }
  }

  const handleResumeSavedGame = () => {
    if (!pendingSavedGame) {
      return
    }

    applySavedGame(pendingSavedGame)
    pushToast('已恢复上一次自动存档。', 'info')
  }

  const handleDiscardSavedGame = () => {
    resetRunState({ clearSave: true })
    pushToast('已放弃上一局进度，重新进入天赋开局。', 'info')
  }

  const handleRestartRun = () => {
    resetRunState({ clearSave: true })
    pushToast('新的一轮打工人生已经开始。', 'info')
  }

  const handleCloseEndgameSummary = () => {
    setEndgameSummary(null)
  }

  const handleConfirmTutorial = () => {
    if (selectedTalentCount !== TALENT_SELECT_REQUIRED) {
      pushToast(`请先选择 ${TALENT_SELECT_REQUIRED} 个天赋再开局。`, 'warning')
      return
    }

    const upgradedState = createInitialGameState(soulUpgrades, selectedTalents)
    const upgradedTalents = selectedTalents.map((item) => item.name)
    setGameState(upgradedState)
    gameStateRef.current = upgradedState
    setTalents(upgradedTalents)
    hasSettledRunRef.current = false
    scamRuinRef.current = false
    setEndgameSummary(null)
    setIsSoulShopOpen(false)
    setIsAchievementsOpen(false)
    setPendingSavedGame(null)
    setIsTutorialOpen(false)
  }

  const handleOpenPhone = () => {
    setPhoneMessages((prev) => {
      const next = prev.map((item) => ({ ...item, isRead: true }))
      phoneMessagesRef.current = next
      return next
    })
    setIsPhoneOpen(true)
  }

  const handleClosePhone = () => {
    setIsPhoneOpen(false)
  }

  const handleOpenShop = () => {
    if (isInteractionLocked) {
      return
    }
    setShopErrorMessage('')
    setMarketErrorMessage('')
    setBackpackErrorMessage('')
    setIsMarketOpen(false)
    setIsBackpackOpen(false)
    setIsShopOpen(true)
  }

  const handleCloseShop = () => {
    setShopErrorMessage('')
    setIsShopOpen(false)
  }

  const handleBuyItem = (item) => {
    if (isInteractionLocked) {
      return
    }

    if (gameStateRef.current.money < item.cost) {
      setShopErrorMessage('穷鬼，钱不够！')
      return
    }

    const nextState = applyEffectDeltaToState(
      {
        ...gameStateRef.current,
        money: roundToCents(gameStateRef.current.money - item.cost),
      },
      item.effects,
    )

    let nextHealthState = healthStateRef.current
    if (item.cures?.sick || item.cures?.depressed) {
      nextHealthState = { ...healthStateRef.current }
      if (item.cures.sick) {
        nextHealthState.sick = false
        nextHealthState.sickDays = 0
      }
      if (item.cures.depressed) {
        nextHealthState.depressed = false
        nextHealthState.depressedDays = 0
      }
      if (!nextHealthState.sick || !nextHealthState.depressed) {
        nextHealthState.dualDebuffDays = 0
      }
      if (!nextHealthState.sick) {
        nextHealthState.lowEnergyDays = 0
      }
      if (!nextHealthState.depressed) {
        nextHealthState.lowSanityDays = 0
      }
      setHealthState(nextHealthState)
      healthStateRef.current = nextHealthState
    }

    setShopErrorMessage('')
    setGameState(nextState)
    gameStateRef.current = nextState
    appendSystemMessage(
      `【系统】你花费了金钱，购买了${item.name}，感觉身体和精神都产生了变化。`,
      effectDeltaToChangePayload(item.cost, item.effects),
    )
    resolveTerminalState(nextState, nextHealthState)
  }

  const handleHospitalize = () => {
    if (isInteractionLocked) {
      return
    }

    if (healthStateRef.current.hospitalTurnsRemaining > 0) {
      setShopErrorMessage('你已经在住院治疗流程中。')
      return
    }

    if (gameStateRef.current.money < HOSPITAL_COST) {
      setShopErrorMessage('住院押金不足，医院拒收。')
      return
    }

    const energyDelta = 100 - gameStateRef.current.energy
    const sanityDelta = 100 - gameStateRef.current.sanity

    const nextState = {
      ...gameStateRef.current,
      money: roundToCents(gameStateRef.current.money - HOSPITAL_COST),
      energy: 100,
      sanity: 100,
      bossFavor: clampStat(gameStateRef.current.bossFavor - HOSPITAL_BOSS_ABSENCE_PENALTY),
    }
    const bossFavorDelta = nextState.bossFavor - gameStateRef.current.bossFavor

    const nextHealthState = {
      ...clearAllDebuffs(healthStateRef.current),
      hospitalTurnsRemaining: HOSPITAL_SKIP_TURNS,
    }

    setShopErrorMessage('')
    setGameState(nextState)
    gameStateRef.current = nextState
    setHealthState(nextHealthState)
    healthStateRef.current = nextHealthState
    appendSystemMessage(
      '【系统】你办理了住院治疗，接下来 3 回合将强制休息，不触发事件；老板因你脱岗暴怒，好感度直降。',
      createChangePayload({
        moneyChange: -HOSPITAL_COST,
        energyChange: energyDelta,
        sanityChange: sanityDelta,
        bossFavorChange: bossFavorDelta,
      }),
    )
    resolveTerminalState(nextState, nextHealthState)
  }

  const handleOpenMarket = () => {
    if (isInteractionLocked) {
      return
    }
    setMarketErrorMessage('')
    setShopErrorMessage('')
    setBackpackErrorMessage('')
    setIsShopOpen(false)
    setIsBackpackOpen(false)
    setIsMarketOpen(true)
  }

  const handleCloseMarket = () => {
    setMarketErrorMessage('')
    setIsMarketOpen(false)
  }

  const handleBuyOneShare = (assetKey) => {
    if (isInteractionLocked) {
      return
    }

    const price = marketPricesRef.current[assetKey]
    if (gameStateRef.current.money < price) {
      setMarketErrorMessage('余额不足，买不了这股。')
      return
    }

    const nextState = {
      ...gameStateRef.current,
      money: roundToCents(gameStateRef.current.money - price),
    }
    const nextHoldings = {
      ...holdingsRef.current,
      [assetKey]: holdingsRef.current[assetKey] + 1,
    }

    setMarketErrorMessage('')
    setGameState(nextState)
    gameStateRef.current = nextState
    setHoldings(nextHoldings)
    holdingsRef.current = nextHoldings
    appendSystemMessage(
      `【系统】你摸鱼买入了 1 股${getAssetNameByKey(assetKey)}，花费 $${price.toFixed(2)}。`,
      createChangePayload({
        moneyChange: -price,
      }),
    )
    resolveTerminalState(nextState, healthStateRef.current)
  }

  const handleSellAllShares = (assetKey) => {
    if (isInteractionLocked) {
      return
    }

    const amount = holdingsRef.current[assetKey]
    if (!amount) {
      setMarketErrorMessage('你当前没有可卖出的持仓。')
      return
    }

    const price = marketPricesRef.current[assetKey]
    const income = roundToCents(price * amount)
    const nextState = {
      ...gameStateRef.current,
      money: roundToCents(gameStateRef.current.money + income),
    }
    const nextHoldings = {
      ...holdingsRef.current,
      [assetKey]: 0,
    }

    setMarketErrorMessage('')
    setGameState(nextState)
    gameStateRef.current = nextState
    setHoldings(nextHoldings)
    holdingsRef.current = nextHoldings
    appendSystemMessage(
      `【系统】你卖出了全部${getAssetNameByKey(assetKey)}（${amount}股），回收资金 $${income.toFixed(2)}。`,
      createChangePayload({
        moneyChange: income,
      }),
    )
    resolveTerminalState(nextState, healthStateRef.current)
  }

  const handleCloseSeller = () => {
    setSellerErrorMessage('')
    setIsSellerOpen(false)
  }

  const handleBuySellerItem = (itemId) => {
    if (isInteractionLocked) {
      return
    }

    const target = sellerOffers.find((item) => item.id === itemId)
    if (!target) {
      setSellerErrorMessage('该道具已下架。')
      return
    }

    if (gameStateRef.current.money < target.price) {
      setSellerErrorMessage('钱包在哭，钱不够。')
      return
    }

    const withEffectState = applyEffectDeltaToState(
      {
        ...gameStateRef.current,
        money: roundToCents(gameStateRef.current.money - target.price),
      },
      target.effectDelta,
    )
    const nextInventory = [...inventoryRef.current, target]
    const nextOffers = sellerOffers.filter((item) => item.id !== itemId)

    setSellerErrorMessage('')
    setGameState(withEffectState)
    gameStateRef.current = withEffectState
    setInventory(nextInventory)
    inventoryRef.current = nextInventory
    setSellerOffers(nextOffers)
    if (!nextOffers.length) {
      setIsSellerOpen(false)
    }
    appendSystemMessage(
      `【系统】你从神秘推销商手里买下了「${target.name}」。表面效果：${target.effect}；隐藏小坑：${target.hiddenFlaw}。`,
      createChangePayload({
        moneyChange: -target.price,
      }),
    )
    resolveTerminalState(withEffectState, healthStateRef.current)
  }

  const handleOpenBackpack = () => {
    if (isInteractionLocked) {
      return
    }
    setBackpackErrorMessage('')
    setShopErrorMessage('')
    setMarketErrorMessage('')
    setIsShopOpen(false)
    setIsMarketOpen(false)
    setIsBackpackOpen(true)
  }

  const handleCloseBackpack = () => {
    setBackpackErrorMessage('')
    setIsBackpackOpen(false)
  }

  const handleSellBackpackItem = (itemId) => {
    if (isInteractionLocked) {
      return
    }

    const target = inventoryRef.current.find((item) => item.id === itemId)
    if (!target) {
      setBackpackErrorMessage('这件道具已经不在背包里了。')
      return
    }

    const resale = getResalePrice(target)
    const nextState = {
      ...gameStateRef.current,
      money: roundToCents(gameStateRef.current.money + resale),
    }
    const nextInventory = inventoryRef.current.filter((item) => item.id !== itemId)

    setBackpackErrorMessage('')
    setGameState(nextState)
    gameStateRef.current = nextState
    setInventory(nextInventory)
    inventoryRef.current = nextInventory
    appendSystemMessage(
      `【系统】你把「${target.name}」二手卖出，回收 $${resale}。`,
      createChangePayload({
        moneyChange: resale,
      }),
    )
    resolveTerminalState(nextState, healthStateRef.current)
  }

  const handleInvestmentAmountChange = (value) => {
    if (!investmentRequest) {
      return
    }
    const max = investmentRequest.maxAmount || 0
    const numeric = Number.isFinite(value) ? Number(value) : 0
    setInvestmentAmount(Math.max(0, Math.min(max, Math.floor(numeric))))
  }

  const handleConfirmInvestment = (rawAmount) => {
    if (isInteractionLocked || !investmentRequest) {
      return
    }

    const shouldEndDayAfterResolve = Boolean(investmentRequest.endDayAfterResolve)

    const maxAmount = Math.max(0, Math.floor(gameStateRef.current.money))
    const amount = Math.max(0, Math.min(maxAmount, Math.floor(Number(rawAmount) || 0)))

    if (amount <= 0) {
      appendSystemMessage('【系统】你临门一脚怂了，最终一分钱都没转。')
      setInvestmentRequest(null)
      commitActiveEvent(null)
      if (shouldEndDayAfterResolve) {
        setCurrentOptions([])
        setIsAwaitingEndDay(true)
        isAwaitingEndDayRef.current = true
        setEndDayButtonText('🌙 终于熬到头了，打卡下班！')
        appendSystemMessage('【系统】今天的事件已处理完，可以打卡下班了。')
      } else {
        setCurrentOptions([])
        scheduleNextWorkEvent()
      }
      return
    }

    const pending = createPendingInvestment(amount, gameStateRef.current.day, gameStateRef.current.luck)
    const nextState = {
      ...gameStateRef.current,
      money: roundToCents(gameStateRef.current.money - amount),
    }
    const nextPending = [...pendingInvestmentsRef.current, pending]

    setGameState(nextState)
    gameStateRef.current = nextState
    setPendingInvestments(nextPending)
    pendingInvestmentsRef.current = nextPending
    setInvestmentRequest(null)
    commitActiveEvent(null)
    if (shouldEndDayAfterResolve) {
      setCurrentOptions([])
      setIsAwaitingEndDay(true)
      isAwaitingEndDayRef.current = true
      setEndDayButtonText('🌙 终于熬到头了，打卡下班！')
      appendSystemMessage('【系统】今天的事件已处理完，可以打卡下班了。')
    } else {
      setCurrentOptions([])
      scheduleNextWorkEvent()
    }

    appendSystemMessage(
      `【系统】你向「${pending.projectName}」打款 $${amount.toFixed(
        2,
      )}，预计 Day ${pending.resolveDay} 前后通过手机消息返回结果。`,
      createChangePayload({ moneyChange: -amount }),
    )
    appendPhoneMessages(
      [
        {
          sender: '投资群助手',
          content: `打款已确认，项目「${pending.projectName}」进入运作阶段，请耐心等待结算。`,
        },
      ],
      gameStateRef.current.day,
    )
    resolveTerminalState(nextState, healthStateRef.current)
  }

  const handleRejectInvestment = () => {
    if (isInteractionLocked || !investmentRequest) {
      return
    }

    const shouldEndDayAfterResolve = Boolean(investmentRequest.endDayAfterResolve)

    appendSystemMessage('【系统】你当场回绝并怒斥对方，对方骂骂咧咧把你拉黑。')
    appendPhoneMessages(
      [{ sender: '陌生号码', content: '你错过了改变命运的机会，以后别后悔。' }],
      gameStateRef.current.day,
    )
    setInvestmentRequest(null)
    commitActiveEvent(null)
    if (shouldEndDayAfterResolve) {
      setCurrentOptions([])
      setIsAwaitingEndDay(true)
      isAwaitingEndDayRef.current = true
      setEndDayButtonText('🌙 终于熬到头了，打卡下班！')
      appendSystemMessage('【系统】今天的事件已处理完，可以打卡下班了。')
    } else {
      setCurrentOptions([])
      scheduleNextWorkEvent()
    }
  }

  const isLowHealthWarning = gameState.energy < 20 || gameState.sanity < 20
  const isHallucinationMode = gameState.sanity < 20
  const showApiKeyGate = isApiKeyBootstrapped && !hasApiKey && !isResumePromptOpen
  const showTutorialModal = hasApiKey && !isResumePromptOpen && isTutorialOpen
  const sidebarToneClass = isHallucinationMode ? 'bg-violet-50/90' : 'bg-white'
  const mainToneClass = isHallucinationMode ? 'bg-violet-50/70' : 'bg-white'

  return (
    <div
      className={`flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 text-slate-800 md:flex-row ${
        isScreenShaking ? 'animate-screen-shake' : ''
      }`}
    >
      <ToastStack toasts={toasts} />

      {isLowHealthWarning ? <div className="pointer-events-none fixed inset-0 z-40 animate-vignette-alert" /> : null}

      <div className="mobile-tab-frame flex min-h-0 flex-col overflow-hidden md:hidden">
        <div
          ref={mobilePagesRef}
          onScroll={handleMobilePagesScroll}
          className="mobile-pages-strip flex h-full w-full flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <section
            className={`mobile-page-scroll h-full min-h-0 w-full shrink-0 snap-center snap-always overflow-y-auto ${sidebarToneClass}`}
          >
            <MobileStatsPage
              gameState={gameState}
              healthState={healthState}
              talents={talents}
              apiKeyInput={apiKeyInput}
              onApiKeyInputChange={setApiKeyInput}
              onSaveApiKey={handleSaveApiKey}
              hasApiKey={hasApiKey}
              apiKeyStatus={apiKeyStatus}
              isHallucinationMode={isHallucinationMode}
            />
          </section>

          <section
            className={`relative flex h-full min-h-0 w-full shrink-0 snap-center snap-always flex-col overflow-hidden ${mainToneClass}`}
          >
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              isGameOver={isGameOver}
              isVictory={isVictory}
              day={gameState.day}
              currentDailyTheme={currentDailyTheme}
              eventsToday={eventsToday}
              maxEventsToday={maxEventsToday}
              isAwaitingEndDay={isAwaitingEndDay}
              onOpenPhone={handleOpenPhone}
              unreadPhoneCount={unreadPhoneCount}
              loadingText={loadingText}
            />
            <InputBar
              options={currentOptions}
              onSelectOption={handleSelectOption}
              onEndDay={handleEndDay}
              onSideHustle={handleSideHustle}
              isLoading={isLoading}
              isInteractionLocked={isInteractionLocked}
              isGameOver={isGameOver}
              isVictory={isVictory}
              hasApiKey={hasApiKey}
              isAwaitingEndDay={isAwaitingEndDay}
              endDayButtonText={endDayButtonText}
              sideHustlesToday={sideHustlesToday}
              sideHustleLimit={SIDE_HUSTLE_LIMIT_PER_DAY}
              eventsToday={eventsToday}
              maxEventsToday={maxEventsToday}
              isInvestmentInputMode={Boolean(investmentRequest)}
              investmentAmount={investmentAmount}
              maxInvestment={investmentRequest?.maxAmount || 0}
              onInvestmentAmountChange={handleInvestmentAmountChange}
              onConfirmInvestment={handleConfirmInvestment}
              onRejectInvestment={handleRejectInvestment}
            />
          </section>

          <section className="mobile-page-scroll h-full min-h-0 w-full shrink-0 snap-center snap-always overflow-y-auto bg-slate-50">
            <MobileHubPage
              onOpenPhone={handleOpenPhone}
              unreadPhoneCount={unreadPhoneCount}
              onOpenShop={handleOpenShop}
              onOpenMarket={handleOpenMarket}
              onOpenBackpack={handleOpenBackpack}
              onOpenSoulShop={handleOpenSoulShop}
              onOpenAchievements={handleOpenAchievements}
              isInteractionLocked={isInteractionLocked}
              isVictory={isVictory}
            />
          </section>
        </div>
      </div>

      <nav className="mobile-tab-bar fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pt-3 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2 rounded-3xl border border-slate-200 bg-white/90 p-2 shadow-lg">
          <button
            type="button"
            onClick={() => scrollToMobileTab(0)}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition ${
              activeTab === 0 ? 'bg-slate-900 text-white' : 'text-slate-500'
            }`}
          >
            <BarChart3 size={18} />
            <span>状态</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToMobileTab(1)}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition ${
              activeTab === 1 ? 'bg-slate-900 text-white' : 'text-slate-500'
            }`}
          >
            <MessageSquare size={18} />
            <span>打工</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToMobileTab(2)}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition ${
              activeTab === 2 ? 'bg-slate-900 text-white' : 'text-slate-500'
            }`}
          >
            <ShoppingCart size={18} />
            <span>广场</span>
          </button>
        </div>
      </nav>

      <div className="hidden h-full min-h-0 w-full md:flex">
        <div
          className={`modal-scroll w-80 shrink-0 overflow-y-auto border-r border-slate-200 md:w-[350px] ${sidebarToneClass}`}
        >
          <SidebarStats
            gameState={gameState}
            healthState={healthState}
            talents={talents}
            onOpenShop={handleOpenShop}
            onOpenMarket={handleOpenMarket}
            onOpenBackpack={handleOpenBackpack}
            isInteractionLocked={isInteractionLocked}
            isVictory={isVictory}
            apiKeyInput={apiKeyInput}
            onApiKeyInputChange={setApiKeyInput}
            onSaveApiKey={handleSaveApiKey}
            hasApiKey={hasApiKey}
            apiKeyStatus={apiKeyStatus}
            isHallucinationMode={isHallucinationMode}
          />
        </div>

        <div className={`relative flex-1 flex min-h-0 min-w-0 flex-col overflow-hidden ${mainToneClass}`}>
          <div className="flex-1 flex min-h-0 min-w-0 flex-col">
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              isGameOver={isGameOver}
              isVictory={isVictory}
              day={gameState.day}
              currentDailyTheme={currentDailyTheme}
              eventsToday={eventsToday}
              maxEventsToday={maxEventsToday}
              isAwaitingEndDay={isAwaitingEndDay}
              onOpenPhone={handleOpenPhone}
              unreadPhoneCount={unreadPhoneCount}
              loadingText={loadingText}
            />
          </div>
          <InputBar
            options={currentOptions}
            onSelectOption={handleSelectOption}
            onEndDay={handleEndDay}
            onSideHustle={handleSideHustle}
            isLoading={isLoading}
            isInteractionLocked={isInteractionLocked}
            isGameOver={isGameOver}
            isVictory={isVictory}
            hasApiKey={hasApiKey}
            isAwaitingEndDay={isAwaitingEndDay}
            endDayButtonText={endDayButtonText}
            sideHustlesToday={sideHustlesToday}
            sideHustleLimit={SIDE_HUSTLE_LIMIT_PER_DAY}
            eventsToday={eventsToday}
            maxEventsToday={maxEventsToday}
            isInvestmentInputMode={Boolean(investmentRequest)}
            investmentAmount={investmentAmount}
            maxInvestment={investmentRequest?.maxAmount || 0}
            onInvestmentAmountChange={handleInvestmentAmountChange}
            onConfirmInvestment={handleConfirmInvestment}
            onRejectInvestment={handleRejectInvestment}
          />
        </div>
      </div>

      <ShopModal
        isOpen={isShopOpen}
        onClose={handleCloseShop}
        items={shopItems}
        money={gameState.money}
        onBuy={handleBuyItem}
        onHospitalize={handleHospitalize}
        hospitalCost={HOSPITAL_COST}
        hospitalTurnsRemaining={healthState.hospitalTurnsRemaining}
        errorMessage={shopErrorMessage}
        isInteractionLocked={isInteractionLocked}
      />

      <InvestmentModal
        isOpen={isMarketOpen}
        onClose={handleCloseMarket}
        availableMoney={gameState.money}
        marketPrices={marketPrices}
        holdings={holdings}
        assets={marketAssets}
        onBuyOne={handleBuyOneShare}
        onSellAll={handleSellAllShares}
        errorMessage={marketErrorMessage}
        isInteractionLocked={isInteractionLocked}
      />

      <MysterySellerModal
        isOpen={isSellerOpen}
        onClose={handleCloseSeller}
        items={sellerOffers}
        onBuy={handleBuySellerItem}
        availableMoney={gameState.money}
        errorMessage={sellerErrorMessage}
        isInteractionLocked={isInteractionLocked}
      />

      <BackpackModal
        isOpen={isBackpackOpen}
        onClose={handleCloseBackpack}
        items={inventory}
        onSellItem={handleSellBackpackItem}
        getResalePrice={getResalePrice}
        errorMessage={backpackErrorMessage}
        isInteractionLocked={isInteractionLocked}
      />

      <PhoneDrawer isOpen={isPhoneOpen} onClose={handleClosePhone} messages={phoneMessages} />

      <ApiKeyGateModal
        isOpen={showApiKeyGate}
        apiKeyInput={apiKeyInput}
        onApiKeyInputChange={setApiKeyInput}
        onSaveApiKey={handleSaveApiKey}
        apiKeyStatus={apiKeyStatus}
      />

      <ResumeSaveModal
        isOpen={isResumePromptOpen}
        savedDay={pendingSavedGame?.gameState?.day || 1}
        onResume={handleResumeSavedGame}
        onRestart={handleDiscardSavedGame}
      />

      <TutorialModal
        isOpen={showTutorialModal}
        onConfirm={handleConfirmTutorial}
        soulPoints={soulPoints}
        talentChoices={talentSelection.choices}
        selectedTalentIds={talentSelection.selectedIds}
        selectedTalentCount={selectedTalentCount}
        requiredTalentCount={TALENT_SELECT_REQUIRED}
        onToggleTalent={handleToggleTalent}
        lockGoldenTalent={soulUpgrades.lockGoldenTalent}
        onOpenSoulShop={handleOpenSoulShop}
        onOpenAchievements={handleOpenAchievements}
        onCheatAddSoul={handleCheatAddSoul}
      />

      <SoulShopModal
        isOpen={isSoulShopOpen}
        onClose={handleCloseSoulShop}
        soulPoints={soulPoints}
        upgrades={soulUpgrades}
        onPurchase={handlePurchaseSoulUpgrade}
        onCheatAddSoul={handleCheatAddSoul}
      />

      <AchievementGalleryModal
        isOpen={isAchievementsOpen}
        onClose={handleCloseAchievements}
        achievements={achievementCatalog}
        unlockedIds={unlockedAchievements}
      />

      <EndgameSummaryModal
        isOpen={Boolean(endgameSummary)}
        isVictory={Boolean(endgameSummary?.isVictory)}
        title={endgameSummary?.title || (isVictory ? 'Victory' : 'Game Over')}
        description={endgameSummary?.description || victoryText}
        survivedDays={endgameSummary?.survivedDays || gameState.day}
        finalMoney={endgameSummary?.finalMoney || gameState.money}
        soulEarned={endgameSummary?.soulEarned || 0}
        soulTotal={endgameSummary?.soulTotal || soulPoints}
        unlockedTitles={endgameSummary?.unlockedTitles || []}
        onAcknowledge={handleCloseEndgameSummary}
        onRestart={handleRestartRun}
      />
    </div>
  )
}

export default App

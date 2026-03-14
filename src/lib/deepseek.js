const API_ENDPOINT = 'https://api.deepseek.com/chat/completions'

const OUTPUT_SCHEMA_RULES = `
输出格式（必须严格遵守）：
{
  "narrative": "老板突然走过来拍了拍你的肩膀...",
  "statChanges": {
    "money": 0,
    "energy": -5,
    "sanity": -10,
    "bossFavor": 0,
    "colleagueFavor": -3,
    "clientFavor": 4
  },
  "options": [
    "默默忍受并接下工作",
    "大声抗议并拒绝",
    "突然倒地装死"
  ],
  "messages": [
    { "sender": "同事老王", "content": "听说科技股要起飞，但真假难说。", "isTrue": true },
    { "sender": "陌生号码", "content": "今晚土狗币必涨 300%，梭哈就完事。", "isTrue": false },
    { "sender": "财经号", "content": "某基金或将小幅回调，注意仓位。", "isTrue": true }
  ],
  "requireInvestmentInput": false
}

硬性要求：
1. 只能输出 JSON 对象，不能输出 Markdown、代码块、解释文本。
2. 字段名必须完全一致，且全部都要有。
3. statChanges 六个字段必须都是整数。money 建议范围 -5000 到 +5000；其余五个属性建议范围 -25 到 +25，且不要全为 0。
4. options 必须正好 3 个字符串，并且绝对不要包含“选项A：/选项B：/选项C：”这类前缀，只返回纯动作文本。
5. messages 必须是数组，且必须正好 3 条；每条都含 sender、content 字符串和 isTrue 布尔值。
6. requireInvestmentInput 必须是布尔值。只有当剧情需要输入投资金额时才设置为 true。
7. 若本回合是“报价/推销/收费”阶段而玩家尚未明确支付，则 statChanges.money 必须为 0。
`

const RESOLUTION_OUTPUT_SCHEMA_RULES = `
输出格式（必须严格遵守）：
{
  "narrative": "你把锅优雅地甩了回去，但老板的眼神更阴了。",
  "statChanges": {
    "money": 0,
    "energy": -5,
    "sanity": -3,
    "bossFavor": -8,
    "colleagueFavor": 2,
    "clientFavor": 0
  }
}

硬性要求：
1. 只能输出 JSON 对象，不能输出 Markdown、代码块、解释文本。
2. 只允许出现 narrative 和 statChanges 两个字段。
3. narrative 必须控制在 50 字以内，只描述本回合后果。
4. statChanges 六个字段都必须是整数。
5. 严禁生成新事件、options、messages、requireInvestmentInput。
`

const DAILY_SYSTEM_RULES = `
你是《打工人模拟器》的 DM（剧情主持人），游戏风格参考《王权 Reigns》。
你的任务：根据玩家选择推进 1 回合剧情，并返回严格 JSON。

世界规则：
1. 这是现代职场生存题材，语气真实、具体、有代入感。
2. 现在的职场不仅有老板，还有喜欢甩锅的同事、提出离谱需求的甲方。
3. 每回合给出 2~4 句剧情，必须是一个可抉择事件，不要复读。
4. 每一天突发事件中，要随机引入同事或甲方互动。
5. 如果玩家背包里有道具，请随机触发道具隐藏小坑，并根据玩家运气判定后果。
6. 玩家今天的隐藏运气值是 {luck}。请在推演职场突发事件的结果时，严格受此影响。高运气逢凶化吉，低运气喝水塞牙。
7. 请在返回的 JSON 中提供 messages 数组，且必须正好 3 条。每条都必须包含 sender、content、isTrue(布尔值)。
8. 你可以偶尔塑造“老同学/前同事找你合伙投资”的诱人叙事，但常规模式下 requireInvestmentInput 通常为 false。
9. 如果玩家依靠高【智慧】做出了绝佳的项目决策，请在 statChanges.money 中大方给予 $1000 到 $5000 的高额项目奖金。
10. 玩家目前属于 {faction}。请在日常职场事件中，偶尔安排同帮派 NPC 与玩家进行无厘头的地下接头或帮派任务，并给予符合帮派设定的奖励或惩罚。
11. 除了普通职场事件，你有 15% 的概率生成一个极其无厘头、搞笑甚至超自然的【荒诞支线任务】（如外星绿植、妖王保温杯、保洁阿姨传功等）。
`

const FORTUNE_TELLER_SYSTEM_RULES = `
你是《打工人模拟器》的 DM（剧情主持人），正在处理一个特殊剧情。
今天触发了特殊事件：玩家在上班路上（或公司楼下）遇到了一位【算卦道人】。
系统机密信息：玩家今天的真实隐藏运气值是 {luck}（1-100，越高越好）。

你的核心任务：
1. 你要在内心随机抛硬币决定这个道人是“半仙”还是“江湖骗子”。
2. 如果他是半仙：请用隐晦玄学语言暗示玩家真实运势，例如“今日你命宫犯紫微，切忌轻举妄动”。
3. 如果他是骗子：请胡说八道并诱导花钱，例如玩家运势很差却被忽悠“今日财神附体，宜大胆投资”。
4. 无论真假，道人都可以索要卦金，或推销改运符箓/护身符。
5. 如果推销道具，请在剧情中点出它可能带有搞笑又坑人的隐藏小坑，以便衔接背包系统。
6. 你依然要推进 1 回合，给出 2~4 句剧情和 3 个可选应对方案。
7. 必须在 messages 中生成正好 3 条真假参半的手机消息，并为每条补充 isTrue 布尔值，继续混入股票或币圈预测。
`

const INVESTMENT_PITCH_SYSTEM_RULES = `
你是《打工人模拟器》的 DM（剧情主持人），正在处理一个特殊投资事件。
今天出现“老同学/前同事找你合伙投资”的局面，项目描述看似极其诱人，但信息真伪混杂。
系统机密信息：玩家今天的隐藏运气值是 {luck}。

你的任务：
1. 给出 2~4 句具有诱惑力但带疑点的项目剧情（可能是天使投资，也可能是杀猪盘）。
2. 你必须将 requireInvestmentInput 设为 true，让前端弹出金额输入交互。
3. 依然返回 3 个 options（用于后续流程衔接）。
4. 必须在 messages 中补充正好 3 条来自同学/财经号/未知号码的旁证消息，每条都要有 isTrue，真假难辨。
`

const CONSUMER_PROTECTION_RULES = `
【交易分步与消费者保护规则（绝对强制）】
1. 严禁越俎代庖（强买强卖）：当 NPC 推销道具、收费服务、索要钱财时，当前回合绝对不允许直接在 statChanges.money 扣钱。
2. 报价回合只报价不结算：如果本回合出现“报价/收费/价格/要钱”等交易信息，当前回合 statChanges.money 必须为 0。
3. 当前回合 options 必须同时提供：
   - 一个明确“支付/掏钱/购买/付款”的选项；
   - 一个明确“拒绝/不买/不付钱/拒绝当冤大头”的选项。
4. 只有当玩家在下一回合输入里明确表达“支付/掏钱/购买/付款/转账/打款/买下”时，才允许在下一回合真实扣钱并发放对应道具或增益。
5. 若玩家未明确同意支付，则 money 变化必须保持为 0，不得先斩后奏。
`

const HALLUCINATION_SYSTEM_RULES = `
⚠️警告：玩家目前精神处于极度崩溃的边缘，已经开始产生严重的幻觉！
请你立刻改变叙事风格！把职场描述成一个【奇幻地下城】或【克苏鲁恐怖世界】。
比如把老板描述成喷火恶龙或触手怪物，把改 Bug 描述成净化诅咒，把甲方描述成不可名状的邪神。
同时，你给出的 3 个应对选项也必须变得极其荒诞、中二或疯狂（例如：大喊一声巴啦啦小魔仙然后跳上办公桌）！
`

const TROLL_DM_RULES = `
【无聊选项封杀协议（绝对执行）】
1. 绝对不允许提供三个都非常正经的应对选项。A/B/C 中至少一个必须极其荒谬、发疯或阴阳怪气。
2. 若玩家选择了看似合理的选项（例如硬着头皮加班），下一回合必须给出无厘头反转展开，正经选项绝对不能有正经后果。
`

const SPEED_RULE =
  '注意：为了提高游戏节奏，请保持剧情描述 (narrative) 极其精简，字数严格控制在 50-80 字以内！选项文字也要非常简短！'

const DEFAULT_OPTIONS = [
  '先稳住局面，再观察老板态度',
  '直接正面硬刚，争取主导权',
  '绕开正面冲突，寻找折中方案',
]

const ZERO_CHANGE_OBJECT = {
  money: 0,
  energy: 0,
  sanity: 0,
  bossFavor: 0,
  colleagueFavor: 0,
  clientFavor: 0,
}

function toInteger(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return 0
  }
  return Math.trunc(numeric)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function normalizeOptions(rawOptions) {
  const valid = Array.isArray(rawOptions)
    ? rawOptions
        .map((item) =>
          typeof item === 'string'
            ? item
                .trim()
                .replace(/^\s*选项\s*[ABCabc]\s*[：:]\s*/, '')
            : '',
        )
        .filter((item) => Boolean(item))
    : []

  const merged = [...valid.slice(0, 3)]
  while (merged.length < 3) {
    merged.push(DEFAULT_OPTIONS[merged.length])
  }
  return merged
}

function normalizeMessages(rawMessages) {
  const fallbackMessages = [
    { sender: '匿名爆料人', content: '老板今晚要开神秘会议，真假难辨。', isTrue: false },
    { sender: '财经小道', content: '基金板块可能小幅波动，先别梭哈。', isTrue: true },
    { sender: '陌生号码', content: '立刻转发可得内幕票，十有八九是坑。', isTrue: false },
  ]

  if (!Array.isArray(rawMessages)) {
    return fallbackMessages
  }

  const normalized = rawMessages
    .map((item) => ({
      sender: typeof item?.sender === 'string' ? item.sender.trim() : '',
      content: typeof item?.content === 'string' ? item.content.trim() : '',
      isTrue: Boolean(item?.isTrue),
    }))
    .filter((item) => item.sender && item.content)
    .slice(0, 3)

  while (normalized.length < 3) {
    normalized.push(fallbackMessages[normalized.length])
  }

  return normalized
}

function normalizeStatChanges(rawStatChanges) {
  return {
    money: clamp(toInteger(rawStatChanges?.money), -5000, 5000),
    energy: clamp(toInteger(rawStatChanges?.energy), -25, 25),
    sanity: clamp(toInteger(rawStatChanges?.sanity), -25, 25),
    bossFavor: clamp(toInteger(rawStatChanges?.bossFavor), -25, 25),
    colleagueFavor: clamp(toInteger(rawStatChanges?.colleagueFavor), -25, 25),
    clientFavor: clamp(toInteger(rawStatChanges?.clientFavor), -25, 25),
  }
}

function buildDailyThemePrompt(dailyTheme) {
  const themeName = typeof dailyTheme?.name === 'string' ? dailyTheme.name.trim() : ''
  const themeDescription =
    typeof dailyTheme?.description === 'string' ? dailyTheme.description.trim() : ''

  if (!themeName || !themeDescription) {
    return ''
  }

  return `【今日职场氛围基调】：${themeName} - ${themeDescription}。你的核心指令：你今天生成的所有突发事件、或者对玩家选项的后果判定，都必须隐晦或直接地呼应这个氛围基调！让玩家感受到今天发生的每一件小事，都是在这个大背景下发生的！`
}

function normalizeResolutionResult(rawResult) {
  const narrative =
    typeof rawResult?.narrative === 'string' && rawResult.narrative.trim()
      ? rawResult.narrative.trim()
      : '【系统】这次选择的后果暂时模糊，但职场不会因此放过你。'

  return {
    narrative,
    statChanges: normalizeStatChanges(rawResult?.statChanges),
  }
}

function normalizeTurnResult(rawResult) {
  const narrative =
    typeof rawResult?.narrative === 'string' && rawResult.narrative.trim()
      ? rawResult.narrative.trim()
      : '【系统】今天的情况有点复杂，你需要再做一次选择。'

  return {
    narrative,
    statChanges: normalizeStatChanges(rawResult?.statChanges),
    options: normalizeOptions(rawResult?.options),
    messages: normalizeMessages(rawResult?.messages),
    requireInvestmentInput: Boolean(rawResult?.requireInvestmentInput),
  }
}

function messageToModelText(message) {
  if (message.role === 'player') {
    return message.content
  }

  if (!message.changes) {
    return message.content
  }

  const changes = {
    ...ZERO_CHANGE_OBJECT,
    money: message.changes.moneyChange,
    energy: message.changes.energyChange,
    sanity: message.changes.sanityChange,
    bossFavor: message.changes.bossFavorChange,
    colleagueFavor: message.changes.colleagueFavorChange,
    clientFavor: message.changes.clientFavorChange,
  }

  return `${message.content}
本回合数值变化：资金${changes.money}，精力${changes.energy}，精神${changes.sanity}，老板好感${changes.bossFavor}，同事关系${changes.colleagueFavor}，甲方满意度${changes.clientFavor}。`
}

function buildPlayerContext({ gameState, talents, inventory }) {
  const talentText = talents.length ? talents.join('、') : '无'
  const inventoryText = inventory.length
    ? inventory
        .map(
          (item) =>
            `${item.name}（效果：${item.effect}；隐藏小坑：${item.hiddenFlaw}；耐久：${item.durability}/${item.maxDurability}）`,
        )
        .join('；')
    : '无'

  return `[当前玩家状态]
资金=${gameState.money.toFixed(2)}
精力=${gameState.energy}
精神=${gameState.sanity}
老板好感=${gameState.bossFavor}
同事关系=${gameState.colleagueFavor}
甲方满意度=${gameState.clientFavor}
智慧=${gameState.wisdom}
运气(隐藏值)=${gameState.luck}
帮派=${gameState.faction || '无党派牛马'}

[当前天赋]
${talentText}

[当前背包与隐藏小坑]
${inventoryText}`
}

function buildSystemPrompt({ mode, gameState, talents, inventory, intraDayContext, dailyTheme }) {
  let rules = DAILY_SYSTEM_RULES
  if (mode === 'fortune_teller') {
    rules = FORTUNE_TELLER_SYSTEM_RULES
  }
  if (mode === 'investment_pitch') {
    rules = INVESTMENT_PITCH_SYSTEM_RULES
  }

  const luckRules = `\n今日隐藏运气值（系统机密）=${gameState.luck}`
  const factionRules = `\n当前帮派信息：玩家属于 ${gameState.faction || '无党派牛马'}。请按该帮派风格植入同伴接头与荒诞任务。`
  const intraDayRules = intraDayContext
    ? `\n[日内事件进度]\n当前是今天的第 ${intraDayContext.eventIndex} 个事件，今天预计共 ${intraDayContext.maxEventsToday} 个事件，当前时段约为 ${intraDayContext.period || '上午'}。请根据该时段生成对应剧情。`
    : ''
  const dailyThemeRules = buildDailyThemePrompt(dailyTheme)
  const hallucinationRules = gameState.sanity < 20 ? `\n${HALLUCINATION_SYSTEM_RULES}` : ''

  return `${rules.replaceAll('{luck}', String(gameState.luck)).replaceAll('{faction}', gameState.faction || '无党派牛马')}
${luckRules}
${factionRules}
${intraDayRules}
${dailyThemeRules ? `\n${dailyThemeRules}` : ''}
${hallucinationRules}

${buildPlayerContext({ gameState, talents, inventory })}

${OUTPUT_SCHEMA_RULES}
${CONSUMER_PROTECTION_RULES}
${TROLL_DM_RULES}

${SPEED_RULE}`
}

export async function requestDeepSeekTurn({
  apiKey,
  playerInput,
  gameState,
  history,
  talents = [],
  inventory = [],
  mode = 'daily_workplace',
  intraDayContext = null,
  dailyTheme = null,
}) {
  const historyMessages = history.slice(-10).map((item) => ({
    role: item.role === 'player' ? 'user' : 'assistant',
    content: messageToModelText(item),
  }))

  const userPayload = JSON.stringify({
    mode,
    playerInput,
    currentStats: {
      money: gameState.money,
      energy: gameState.energy,
      sanity: gameState.sanity,
      bossFavor: gameState.bossFavor,
      colleagueFavor: gameState.colleagueFavor,
      clientFavor: gameState.clientFavor,
      wisdom: gameState.wisdom,
      luck: gameState.luck,
      faction: gameState.faction || '无党派牛马',
    },
    talents,
    dailyTheme,
    intraDayContext,
    inventory: inventory.map((item) => ({
      name: item.name,
      effect: item.effect,
      hiddenFlaw: item.hiddenFlaw,
      durability: item.durability,
      maxDurability: item.maxDurability,
    })),
    instruction:
      mode === 'fortune_teller'
        ? '请处理【算卦道人】特殊事件，输出 narrative + statChanges + options + messages + requireInvestmentInput 的 JSON。'
        : mode === 'investment_pitch'
          ? '请处理【天使投资/杀猪盘】特殊事件，必须 requireInvestmentInput=true，输出完整 JSON。'
          : '请推进 1 回合职场剧情，输出 narrative + statChanges + options + messages + requireInvestmentInput 的 JSON。',
  })

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt({ mode, gameState, talents, inventory, intraDayContext, dailyTheme }),
        },
        ...historyMessages,
        { role: 'user', content: userPayload },
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message || 'DeepSeek 接口调用失败。')
  }

  const content = data?.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('DeepSeek 返回为空，无法继续回合。')
  }

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('AI 返回的内容不是合法 JSON。')
  }

  return normalizeTurnResult(parsed)
}

export async function requestDeepSeekResolution({
  apiKey,
  eventNarrative,
  selectedOption,
  gameState,
  history,
  talents = [],
  inventory = [],
  dailyTheme = null,
}) {
  const historyMessages = history.slice(-8).map((item) => ({
    role: item.role === 'player' ? 'user' : 'assistant',
    content: messageToModelText(item),
  }))

  const dailyThemeRules = buildDailyThemePrompt(dailyTheme)

  const systemPrompt = `你是《打工人模拟器》的判卷裁判，只负责结算当前这一条选择造成的后果。
请结合玩家属性、帮派、天赋和背包道具，判定本回合的即时收益或代价。
不要生成下一题，不要追加 options，不要提供手机消息，不要要求输入金额。

${dailyThemeRules ? `${dailyThemeRules}
` : ''}${buildPlayerContext({ gameState, talents, inventory })}

${RESOLUTION_OUTPUT_SCHEMA_RULES}`

  const userPrompt = `【判卷任务】
事件：${eventNarrative}
玩家选择：${selectedOption}
请只返回 50 字以内的 narrative 和 statChanges，不准生成新事件和选项。`

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...historyMessages,
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message || 'DeepSeek 判卷失败。')
  }

  const content = data?.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('DeepSeek 判卷返回为空。')
  }

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('AI 判卷结果不是合法 JSON。')
  }

  return normalizeResolutionResult(parsed)
}

export function applyTurnChanges(gameState, turnResult) {
  return {
    ...gameState,
    day: gameState.day + 1,
    money: gameState.money + turnResult.statChanges.money,
    energy: clamp(gameState.energy + turnResult.statChanges.energy, 0, 100),
    sanity: clamp(gameState.sanity + turnResult.statChanges.sanity, 0, 100),
    bossFavor: clamp(gameState.bossFavor + turnResult.statChanges.bossFavor, 0, 100),
    colleagueFavor: clamp(gameState.colleagueFavor + turnResult.statChanges.colleagueFavor, 0, 100),
    clientFavor: clamp(gameState.clientFavor + turnResult.statChanges.clientFavor, 0, 100),
    wisdom: clamp(gameState.wisdom, 0, 100),
    luck: clamp(gameState.luck, 0, 100),
  }
}

export function getGameOverReason(gameState) {
  if (gameState.energy <= 0) {
    return '精力归零，你在工位上彻底倒下。'
  }
  if (gameState.sanity <= 0) {
    return '精神状态归零，你需要立刻离开职场现场。'
  }
  if (gameState.bossFavor <= 0) {
    return '老板好感度归零，你被请去谈话并结束试用。'
  }
  if (gameState.colleagueFavor <= 0) {
    return '同事关系崩盘，你在办公室里被全面孤立。'
  }
  if (gameState.clientFavor <= 0) {
    return '甲方满意度归零，项目被强制终止。'
  }
  return ''
}

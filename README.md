# 打工人模拟器 / Dagongren Simulator

一个由 React + Vite + Tailwind CSS 构建的黑色幽默职场生存游戏。你将在 30 天内扮演一名当代打工人，在老板、同事、甲方、投资骗局、神秘推销商和真假消息之间挣扎求生。

A darkly comedic workplace survival game built with React + Vite + Tailwind CSS. Survive 30 in-game days as a modern office worker while dealing with bosses, coworkers, clients, scam investments, mysterious vendors, and真假难辨的手机消息.

---

## 目录 / Table of Contents

- [项目简介 / Overview](#项目简介--overview)
- [核心特色 / Key Features](#核心特色--key-features)
- [玩法循环 / Gameplay Loop](#玩法循环--gameplay-loop)
- [核心系统 / Core Systems](#核心系统--core-systems)
- [界面与交互 / UI and UX](#界面与交互--ui-and-ux)
- [技术栈 / Tech Stack](#技术栈--tech-stack)
- [快速开始 / Quick Start](#快速开始--quick-start)
- [项目结构 / Project Structure](#项目结构--project-structure)
- [本地存储 / Local Storage](#本地存储--local-storage)
- [开发说明 / Development Notes](#开发说明--development-notes)
- [后续扩展建议 / Extension Ideas](#后续扩展建议--extension-ideas)
- [许可证 / License](#许可证--license)

---

## 项目简介 / Overview

### 中文

《打工人模拟器》是一款以现代职场为背景的 AI 叙事互动游戏。玩家需要在有限的数值资源内做出选择，平衡：

- 资金 `Money`
- 精力 `Energy`
- 精神状态 `Sanity`
- 老板好感 `Boss Favor`
- 同事关系 `Colleague Favor`
- 甲方满意度 `Client Favor`
- 智慧 `Wisdom`
- 运气 `Luck`

游戏采用“本地事件池 + AI 实时生成 + AI 统一判卷”的混合驱动方式，在保证节奏流畅的同时，尽量让剧情保持荒诞、尖锐和连续。

### English

**Dagongren Simulator** is an AI-assisted interactive narrative game set in the modern workplace. The player must survive with limited stats and constantly balance:

- `Money`
- `Energy`
- `Sanity`
- `Boss Favor`
- `Colleague Favor`
- `Client Favor`
- `Wisdom`
- `Luck`

The game uses a hybrid flow of **local event pools + AI event generation + AI-only resolution**, aiming to keep the pacing fast while preserving absurd, satirical, and coherent storytelling.

---

## 核心特色 / Key Features

### 中文

- `40% / 60%` 混合事件引擎：40% 概率瞬时命中本地经典事件，60% 概率调用 DeepSeek 生成全新剧情。
- `100% AI 判卷`：无论事件来自本地还是 AI，玩家做出选择后都统一交由 AI 判定后果。
- `日间主题锚点`：每天都会抽取一个“职场氛围主题”，统一影响当天的生成与判卷。
- `动态搞笑 Loading`：AI 思考时会循环显示搞笑加载文案，增强等待体验。
- `自动存档 / 继续搬砖 / 重新投胎`：支持 localStorage 自动存档、恢复未完成跑局，以及死亡或通关后的重新开局。
- `灵魂点局外成长`：死亡不会清空灵魂点与成就，可通过灵魂商店进行长期成长。
- `成就图鉴系统`：记录不同死法、通关方式与特殊结局。
- `神秘推销商 / 投资骗局 / 帮派邀请 / 手机真假消息`：构成更丰富的事件生态。
- `桌面端 + 移动端双形态 UI`：PC 保持左右分栏，移动端为三页式底部导航 App 体验。

### English

- `40% / 60% hybrid event engine`: 40% chance to instantly pull a local classic event, 60% chance to request a brand-new AI-generated scenario.
- `100% AI resolution`: every player choice is resolved by AI, regardless of whether the event came from local data or AI generation.
- `Daily Theme Anchors`: each day has a workplace mood/theme that influences both generation and resolution.
- `Dynamic comedic loading`: rotating funny loading text improves the wait experience during AI requests.
- `Auto-save / Resume / Reincarnate`: localStorage-based run persistence, resume prompts, and clean restart flow after death or victory.
- `Meta progression via Soul Points`: achievements and soul points persist across runs.
- `Achievement gallery`: tracks bad endings, win conditions, and unusual outcomes.
- `Mysterious seller / scam investments / faction invites /真假手机消息`: adds more variety to event flow.
- `Desktop + mobile responsive UX`: desktop keeps a split layout, mobile uses a bottom-tab three-page app structure.

---

## 玩法循环 / Gameplay Loop

### 中文

1. 输入并保存 DeepSeek API Key。
2. 进入新一局，抽取或锁定天赋。
3. 每天经历 `2 ~ 4` 个事件。
4. 在聊天流中阅读剧情，并从底部行动区选择应对方案。
5. AI 判定数值变化、关系波动和可能的隐藏代价。
6. 在商店、背包、股票、灵魂商店、手机消息等系统中继续经营角色。
7. 每天结束后结算工资、Debuff、医疗与跨天维护。
8. 活过 `30` 天或达成财富目标可通关；破产、崩溃、生病抑郁连锁等会触发死亡结局。

### English

1. Enter and save a DeepSeek API key.
2. Start a new run and draft or lock talents.
3. Go through `2 ~ 4` events per day.
4. Read the narrative in the chat flow and choose an action from the bottom action area.
5. Let AI resolve stat changes, relationship shifts, and hidden consequences.
6. Continue managing the character through the shop, backpack, stock market, soul shop, and phone message systems.
7. End the day to process salary, debuffs, hospital states, and daily maintenance.
8. Survive `30` days or reach the wealth target to win; bankruptcy, collapse, and chained health failures lead to game over.

---

## 核心系统 / Core Systems

### 1. 事件生成系统 / Event Generation

**中文**

- 本地事件池内置多个经典离谱职场场景，保证无 API 延迟时依然有内容。
- AI 事件生成会结合玩家属性、阵营、道具、日内进度和“今日主题”构造 Prompt。
- 投资、算命、神秘推销商、帮派邀请等特殊事件使用独立模式控制。

**English**

- A local event pool contains multiple absurd workplace scenarios, ensuring instant content even without generation delay.
- AI event generation uses player stats, faction, inventory, intra-day progress, and the current daily theme to build prompts.
- Special modes such as fortune teller, investment pitches, mysterious sellers, and faction invites are handled separately.

### 2. AI 判卷系统 / AI Resolution

**中文**

- 玩家点击选项后，系统不会直接给出固定结果，而是将“事件 + 选项 + 当前状态”提交给 AI。
- AI 只返回本回合的 `narrative + statChanges`，不生成下一题，保持职责单一。
- 这样能让本地事件和 AI 事件在后果上保持统一质量。

**English**

- After the player clicks an option, the system does not resolve it with a hardcoded result.
- Instead, it sends the `event + selected option + current state` to AI.
- AI only returns `narrative + statChanges` for the current turn and does not generate the next event, keeping the flow modular and consistent.

### 3. 日间主题锚点 / Daily Theme Anchors

**中文**

- 每一天都会抽取一个新的职场主题，例如裁员风暴、审计前夜、办公室谣言季等。
- 该主题会显示在聊天区顶部通告栏中。
- 主题信息会注入 AI 出题与 AI 判卷 Prompt，同时写入存档，刷新页面后不会漂移。

**English**

- Each day draws a new workplace atmosphere theme such as layoff panic, pre-audit tension, or rumor season.
- The current theme is displayed in a top announcement bar above the chat flow.
- It is injected into both AI generation and AI resolution prompts, and it is also saved in local storage so refreshing the page does not change the day’s tone.

### 4. 数值与死亡逻辑 / Stats and Failure States

**中文**

- 关键属性归零会触发不同结局。
- 生病与抑郁叠加过久会导致死亡。
- 破产、总资产归零、关系崩盘等都可能结束一局游戏。
- 提前退休与熬过 30 天则属于胜利路径。

**English**

- Different stats reaching zero trigger different endings.
- Staying both sick and depressed for too long can kill the run.
- Bankruptcy, zero total assets, and relationship collapse may also end the game.
- Early retirement and surviving 30 days are victory paths.

### 5. 背包、商店与神秘推销商 / Inventory, Shop, and Mysterious Seller

**中文**

- 可购买带有显性效果和隐藏副作用的道具。
- 道具具有耐久度，会在后续事件中被消耗或触发反噬。
- 神秘推销商会随机刷新特殊商品，补充常规商店之外的高风险选择。

**English**

- Players can buy items with both visible benefits and hidden downsides.
- Items have durability and may be consumed or backfire in later events.
- The mysterious seller offers special items outside the regular shop, adding more risky choices.

### 6. 股票与投资系统 / Market and Investment

**中文**

- 提供不同风险等级的资产，如基金、科技股、加密资产。
- 特殊剧情中还可能出现“前同事融资局”“天使轮项目”等投资诱导事件。
- AI 会结合玩家状态和运气，对投资后果进行判定。

**English**

- The game includes multiple asset classes such as funds, tech stocks, and crypto-like risky instruments.
- Special narrative events may introduce “former coworker investment opportunities” or fake angel-round projects.
- AI resolves the investment consequences based on player state and luck.

### 7. 手机消息与真假信息 / Phone Messages and True-False Information

**中文**

- 每回合可生成真假掺半的手机消息。
- 消息可能影响你对股票、币圈、同事消息和事件走向的判断。
- 真消息与假消息混杂，目的是制造额外决策噪音。

**English**

- Each turn can generate mixed phone messages with both true and false information.
- These messages may affect the player’s judgment about stocks, crypto, coworkers, and narrative direction.
- The blend of real and fake tips intentionally adds noise to decision-making.

### 8. 灵魂点与成就 / Soul Points and Achievements

**中文**

- 死亡或通关后会进入结算。
- `Soul Points` 与已解锁成就会永久保留，不随单局存档销毁。
- 玩家可以在灵魂商店中购买局外升级，例如初始资金增强、锁定金色天赋等。

**English**

- Each death or victory leads to a run summary.
- `Soul Points` and unlocked achievements persist permanently and are not deleted with run saves.
- Players can spend meta currency in the soul shop on long-term upgrades such as extra starting cash or locked golden talents.

---

## 界面与交互 / UI and UX

### 中文

- `PC 端`：左侧为状态与系统面板，右侧为聊天与行动区。
- `移动端`：采用三页式结构，底部导航切换“状态 / 打工 / 广场”。
- `聊天区`：三段式 Flex 布局，顶部固定头部与“今日主题”通告，中间独立滚动，底部行动区不遮挡消息。
- `弹窗系统`：商店、背包、成就、教程、灵魂商店等统一采用可滚动、最大高度受限的现代弹窗结构。
- `首次体验`：若未输入 API Key，会先弹出强制输入框，避免用户进入半瘫痪状态的主界面。

### English

- `Desktop`: a left-side stats/system panel and a right-side chat/action area.
- `Mobile`: a three-page structure with bottom tabs for `Stats / Work / Hub`.
- `Chat area`: a strict three-part flex layout with a fixed top section, independent scrolling middle section, and a bottom action area that does not cover messages.
- `Modal system`: shop, backpack, achievements, tutorial, soul shop, and other overlays share a modern, scrollable, max-height-limited modal layout.
- `First-time onboarding`: if no API key is provided, the game blocks entry with a prominent API-key gate modal.

---

## 技术栈 / Tech Stack

| 类别 / Category | 内容 / Stack |
| --- | --- |
| Framework | React 19 |
| Bundler | Vite 7 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| AI Provider | DeepSeek Chat Completions API |
| Persistence | Browser localStorage |
| Language | JavaScript (ES Modules) |

---

## 快速开始 / Quick Start

### 环境要求 / Requirements

- Node.js `18+` recommended
- npm `9+` recommended

### 安装 / Install

```bash
npm install
```

### 本地开发 / Start Dev Server

```bash
npm run dev
```

### 生产构建 / Production Build

```bash
npm run build
```

### 本地预览 / Preview Build

```bash
npm run preview
```

### 首次运行说明 / First Run Notes

**中文**

- 本项目没有后端服务，前端会直接请求 DeepSeek API。
- 进入游戏后，需要在界面中输入并保存 API Key。
- API Key 仅保存在当前浏览器的 localStorage 中，不会上传到本仓库。

**English**

- This project has no backend service; the frontend calls the DeepSeek API directly.
- After opening the app, you need to paste and save an API key in the UI.
- The API key is stored only in the current browser’s localStorage and is not committed to this repository.

---

## 项目结构 / Project Structure

```text
dagongren-simulator/
├─ public/                    # 静态资源 / static assets
├─ src/
│  ├─ components/
│  │  ├─ ChatPanel.jsx        # 聊天流与顶部通告 / chat flow + theme banner
│  │  ├─ InputBar.jsx         # 行动区 / option and action area
│  │  ├─ SidebarStats.jsx     # 桌面端侧栏 / desktop stats dashboard
│  │  ├─ MobileStatsPage.jsx  # 移动端状态页 / mobile stats page
│  │  ├─ MobileHubPage.jsx    # 移动端广场页 / mobile hub page
│  │  ├─ PhoneDrawer.jsx      # 手机消息抽屉 / phone messages drawer
│  │  ├─ ShopModal.jsx        # 商店 / shop
│  │  ├─ BackpackModal.jsx    # 背包 / backpack
│  │  ├─ SoulShopModal.jsx    # 灵魂商店 / soul shop
│  │  ├─ AchievementGalleryModal.jsx
│  │  ├─ MysterySellerModal.jsx
│  │  ├─ InvestmentModal.jsx
│  │  ├─ TutorialModal.jsx
│  │  ├─ ResumeSaveModal.jsx
│  │  ├─ ApiKeyGateModal.jsx
│  │  ├─ EndgameSummaryModal.jsx
│  │  └─ ModalShell.jsx       # 通用弹窗骨架 / shared modal shell
│  ├─ lib/
│  │  └─ deepseek.js          # AI Prompt、格式规范、请求封装 / AI prompt and request layer
│  ├─ App.jsx                 # 核心游戏状态与流程控制 / main game state and flow
│  ├─ index.css               # 全局样式 / global styles
│  └─ main.jsx                # 应用入口 / app entry
├─ package.json
├─ vite.config.js
└─ README.md
```

---

## 本地存储 / Local Storage

### 存储键 / Storage Keys

| Key | 用途（中文） | Purpose (English) |
| --- | --- | --- |
| `dagongren.deepseek.api_key` | 保存 DeepSeek API Key | Stores the DeepSeek API key |
| `dagongren_save` | 单局游戏自动存档 | Stores the current run save |
| `dagongren.meta.soul_points` | 灵魂点局外成长 | Stores persistent soul points |
| `dagongren.meta.soul_upgrades` | 灵魂商店升级 | Stores persistent soul upgrades |
| `dagongren.meta.achievements` | 已解锁成就 | Stores unlocked achievements |

### 存档说明 / Save Behavior

**中文**

- 跨天结算后自动存档。
- 剧情推进与数值更新后自动存档。
- 刷新页面时，若检测到未完结存档，会弹出“继续搬砖 / 重新投胎”选择。
- 触发死亡或通关时，会销毁当前跑局存档，但不会清空灵魂点和成就。

**English**

- The game auto-saves after end-of-day settlement.
- It also auto-saves after narrative progression and stat updates.
- On refresh, the game detects unfinished saves and prompts the player to either resume or restart.
- On death or victory, the current run save is deleted, while soul points and achievements remain intact.

---

## 开发说明 / Development Notes

### 中文

- `App.jsx` 是核心状态机，管理：
  - 当前跑局状态
  - 自动存档与读档
  - 日间主题
  - 混合事件生成
  - AI 判卷
  - 特殊支线
  - 跨天维护
  - 结局与重开
- `deepseek.js` 负责：
  - Prompt 组装
  - JSON 输出约束
  - AI 事件生成请求
  - AI 判卷请求
  - AI 结果归一化
- 前端通过 `fetch` 直连 DeepSeek，因此如果你要用于生产环境，建议后续增加服务端代理与 Key 管理方案。

### English

- `App.jsx` acts as the main state machine and coordinates:
  - current run state
  - auto-save / load
  - daily themes
  - hybrid event generation
  - AI resolution
  - special branches
  - end-of-day maintenance
  - endings and restart flow
- `deepseek.js` handles:
  - prompt assembly
  - JSON output rules
  - AI event generation requests
  - AI resolution requests
  - normalization of AI results
- Since the frontend calls DeepSeek directly via `fetch`, a production deployment should ideally introduce a backend proxy and safer key management.

---

## 后续扩展建议 / Extension Ideas

### 中文

- 增加更多本地事件池、帮派、投资骗局和结局。
- 引入更复杂的道具组合与耐久衰减机制。
- 为股票系统加入新闻事件与市场波动叙事。
- 将手机消息与主事件结果做更强的联动。
- 加入服务器代理层，支持排行榜、云存档和更安全的 API 调用。

### English

- Add more local events, factions, scam branches, and endings.
- Expand item interactions and durability decay mechanics.
- Introduce news-driven market events for the stock system.
- Link phone-message truthfulness more strongly to major narrative outcomes.
- Add a backend proxy for leaderboards, cloud saves, and safer API handling.

---

## 许可证 / License

本项目采用仓库内的 [LICENSE](./LICENSE)。

This project is distributed under the [LICENSE](./LICENSE) included in the repository.

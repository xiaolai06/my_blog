# ClothHub 项目源码审阅

审阅范围：`D:\desktop\clothesHub` 的前端、后端、独立数据服务、颜色处理代码、依赖清单和使用说明。没有读取 `.env`、数据库文件或真实业务记录，也没有修改 ClothHub 源码。下文以当前代码为准；已有简历和使用说明里与源码不符或无法由代码证明的描述不作为项目事实。

## 一句话定位

ClothHub（智汇衣链）是一套面向服装电商小团队的运营工作台，把商品、店铺、订单、采购、客户、营销、分析与财务记录放进一个可登录的后台，并提供选品数据工具、服装图片换色和可选的 AI 助手。

## 应用场景

- 多渠道经营者在同一工作台维护店铺、店铺上架商品、库存与订单，查看近期经营概览。
- 运营或采购人员跟进订单、供应商和采购单，登记采购收货并联动商品库存，同时维护客户与合同。
- 商品企划人员比较平台趋势与成本、整理选品报告，或上传服装图片预览颜色变化；财务人员查看经营汇总并导入记账表格。

## 功能模块

### 1. 运营首页与店铺

首页把经营指标、订单状态、品类和近期记录汇总在一起；店铺页用店铺与商品关联管理多渠道上架信息。首页指标来自后端聚合接口，店铺数据走持久化 API。源码：[DashboardContent.tsx](<D:/desktop/clothesHub/frontend/src/components/DashboardContent.tsx:1>)、[dashboard/router.py](<D:/desktop/clothesHub/backend/dashboard/router.py:1>)、[StoresContent.tsx](<D:/desktop/clothesHub/frontend/src/components/StoresContent.tsx:160>)、[stores/router.py](<D:/desktop/clothesHub/backend/stores/router.py:1>)。

- **经营概览**：呈现订单、营收、商品及库存等汇总卡片和趋势/分布图。
- **近期动态**：查看最近订单、订单状态分布、商品分类和供应商概况。
- **店铺维护**：新增、编辑、删除店铺并切换店铺状态。
- **商品上架**：搜索商品并关联到店铺，调整店铺售价、上架状态或移除关联。
- **工作台导航**：桌面侧栏可折叠，移动端有抽屉菜单和底部常用入口；当前模块以根页面内的状态切换呈现。

### 2. 商品与订单

商品和订单模块采用列表、筛选器与表单/详情弹层的交互方式，并通过前端 hooks 对接后端 CRUD 路由。订单和商品在仪表盘、分析与财务接口中也被聚合读取。源码：[ProductsContent.tsx](<D:/desktop/clothesHub/frontend/src/components/ProductsContent.tsx:1>)、[useProducts.ts](<D:/desktop/clothesHub/frontend/src/hooks/useProducts.ts:1>)、[OrdersContent.tsx](<D:/desktop/clothesHub/frontend/src/components/OrdersContent.tsx:1>)、[OrderFormModal.tsx](<D:/desktop/clothesHub/frontend/src/components/orders/OrderFormModal.tsx:1>)、[orders/router.py](<D:/desktop/clothesHub/backend/orders/router.py:1>)。

- **商品分类**：按分类树浏览商品，支持分类筛选与分类维护。
- **商品检索**：列表支持关键词防抖搜索、状态与日期过滤、分页及排序。
- **商品编辑**：表单维护 SKU、图片、成本/售价、库存、分类等字段；可批量切换商品状态。
- **订单创建**：选择客户和商品、调整数量、选择物流/支付方式并计算订单合计。
- **订单跟进**：按状态、日期、客户、物流或分类筛选，查看订单明细并执行允许的状态流转。

### 3. 供应商与采购

供应链页把供应商和采购单放在同一视图，支持采购单状态推进和收货处理；源码在收货逻辑中更新对应商品库存，因此适合演示业务模块间的数据联动。源码：[SupplyChainContent.tsx](<D:/desktop/clothesHub/frontend/src/components/SupplyChainContent.tsx:1>)、[supply/router.py](<D:/desktop/clothesHub/backend/supply/router.py:1>)、[models.py](<D:/desktop/clothesHub/backend/models.py:1>)。

- **供应商档案**：维护供应商资料、合作状态、等级、联系人与评分，并可搜索和编辑。
- **采购单列表**：按状态、关键词、日期和分类筛选采购记录，支持分页与排序。
- **采购单录入**：从商品中选品，填写数量和单价并自动汇总金额。
- **状态跟进**：采购单按草稿、提交、审核、发货、收货等状态推进。
- **收货入库**：采购单收货时由后端更新商品库存，形成采购到库存的联动。

### 4. 客户、合同与消息

这组模块覆盖客户资料、合同台账、站内消息和账户设置。客户统计包含消费摘要与 RFM 相关页面/接口；合同提供状态流程；消息支持阅读状态管理。源码：[CustomersContent.tsx](<D:/desktop/clothesHub/frontend/src/components/CustomersContent.tsx:180>)、[customers/router.py](<D:/desktop/clothesHub/backend/customers/router.py:1>)、[ContractsContent.tsx](<D:/desktop/clothesHub/frontend/src/components/ContractsContent.tsx:110>)、[contracts/router.py](<D:/desktop/clothesHub/backend/contracts/router.py:1>)、[MessagesContent.tsx](<D:/desktop/clothesHub/frontend/src/components/MessagesContent.tsx:1>)。

- **客户分层**：按等级、状态、来源和城市筛选客户，查看消费额、订单数和最近下单信息。
- **客户档案**：新增或修改客户资料、标签、来源、等级和备注。
- **RFM 信息**：详情与分析界面展示客户价值分群相关数据；其数据质量取决于数据库中的订单与客户记录。
- **合同台账**：按类型、状态、公司和关键词筛选合同，查看合同双方、金额、有效期与明细。
- **消息处理**：按消息类型和未读状态过滤，查看详情、标记已读、全部已读或删除。

### 5. 数据分析、财务与营销

分析页聚合订单、商品、客户和店铺数据，支持图表/列表切换、趋势下钻和 CSV 导出；财务页合并经营财务与记账；营销页维护活动、券和规则，并提供平台 CSV 导入。财务预测及部分成本拆分属于计算或估算结果，展示时不应表述为外部平台的实际结算数据。源码：[AnalyticsContent.tsx](<D:/desktop/clothesHub/frontend/src/components/AnalyticsContent.tsx:42>)、[analytics/router.py](<D:/desktop/clothesHub/backend/analytics/router.py:1>)、[FinanceAccountingContent.tsx](<D:/desktop/clothesHub/frontend/src/components/FinanceAccountingContent.tsx:104>)、[finance/router.py](<D:/desktop/clothesHub/backend/finance/router.py:1>)、[MarketingContent.tsx](<D:/desktop/clothesHub/frontend/src/components/MarketingContent.tsx:80>)、[marketing/router.py](<D:/desktop/clothesHub/backend/marketing/router.py:1>)。

- **趋势分析**：查看销售趋势、商品排行、品类分布、客户分析和店铺对比，可调整趋势周期及排行指标。
- **图表下钻与导出**：点击趋势查看日期订单明细，分析数据提供 CSV 导出入口。
- **财务概览**：展示利润趋势、资金流预测、结算日历、商品利润及成本分解；其中预测/估算需与实际账务区分。
- **记账导入**：维护收入/支出记录，支持批量导入 `.xlsx`、`.xls` 和 `.csv` 文件并查看统计趋势。
- **营销维护**：管理促销、优惠券和折扣规则，查看基于订单聚合的营销指标，并通过平台模板导入 CSV。

### 6. 选品中心与数据服务

选品中心包含趋势雷达、利润计算、选品报告和“套件广场”等界面；仓库另有 8100 端口的数据服务和多种采集器。采集路径具备真实抓取实现，也含公开接口、浏览器登录态、数据库估算和硬编码回退，因此不应把所有展示数据都称作实时平台数据。源码：[SelectionCenterContent.tsx](<D:/desktop/clothesHub/frontend/src/components/SelectionCenterContent.tsx:95>)、[insight/router.py](<D:/desktop/clothesHub/backend/insight/router.py:899>)、[data-service/main.py](<D:/desktop/clothesHub/data-service/main.py:47>)、[douyin_index.py](<D:/desktop/clothesHub/data-service/fetchers/douyin_index.py:87>)、[supply_1688.py](<D:/desktop/clothesHub/data-service/fetchers/supply_1688.py:69>)。

- **趋势看板**：按平台和热度查看关键词/商品趋势，支持排序、历史对比等界面操作。
- **利润测算**：输入品类、售价、销量和平台成本参数，调用后端计算预估收益。
- **选品报告**：根据现有聚合/规则生成建议、预算分配、时间线和风险项，并可导出报告数据。
- **数据采集**：独立服务提供关键词、成本读取与手动同步接口；抖音/拼多多/1688采集器含 Playwright/CDP 路径，淘宝使用公开建议接口。
- **回退标记**：采集失败或数据不足时存在硬编码/数据库估算回退；应把这些结果称为演示或回退数据，而非实时抓取结论。

### 7. AI 助手

AI 助手后端实现了会话持久化、SSE 流式返回、意图路由、按页面上下文筛选工具及多轮工具调用；这部分并非只有静态聊天 UI。不过模型服务需有用户配置或环境 API key，未配置时后端明确进入 mock 分支，返回固定提示文本，不能据此宣称可直接进行真实问答或 CRUD。源码：[AIAssistantSheet.tsx](<D:/desktop/clothesHub/frontend/src/components/AIAssistantSheet.tsx:513>)、[router.py](<D:/desktop/clothesHub/backend/ai_assistant/router.py:185>)、[agents.py](<D:/desktop/clothesHub/backend/ai_assistant/agents.py:391>)、[tools.py](<D:/desktop/clothesHub/backend/ai_assistant/tools.py:1>)。

- **会话管理**：保存、读取和删除会话及消息记录。
- **意图路由**：根据消息关键词和当前模块上下文选择专用 Agent；可在界面选择 Agent/模型（取决于配置能力）。
- **工具裁剪**：依据当前模块和 Agent 可用工具动态筛选调用范围。
- **流式交互**：通过 SSE 推送回答与工具调用状态，前端支持 Markdown 展示、停止生成及复制回答。
- **条件式 AI 能力**：配置兼容 OpenAI 的模型服务后才会执行真实模型与工具调用；无 API key 时会落入固定 mock 回复。

### 8. 商品设计与换色

商品制作页可上传服装图片、识别衣物区域、选择颜色并生成换色预览，同时提供颜色库、个人调色板和历史记录。FastAPI 主应用注册了 `/api/colors` 路由。代码实现了 SegFormer 分割，并带 GrabCut 回退；未在本次审阅中运行推理或核实效果与耗时。源码：[DesignStudioContent.tsx](<D:/desktop/clothesHub/frontend/src/components/DesignStudioContent.tsx:99>)、[colors/router.py](<D:/desktop/clothesHub/backend/colors/router.py:43>)、[segmentation.py](<D:/desktop/clothesHub/backend/colors/segmentation.py:97>)、[image_processor.py](<D:/desktop/clothesHub/backend/colors/image_processor.py:24>)、[main.py](<D:/desktop/clothesHub/backend/main.py:189>)。

- **图片上传**：浏览器选择图片并预览，支持调用识别接口。
- **区域识别**：后端生成服装分割/局部遮罩；模型不可用时有 GrabCut 回退路径。
- **颜色预览**：选择目标色和强度，按 LAB/图像处理逻辑生成单色或多区域换色结果。
- **色板管理**：读取颜色分类与调色板，可维护用户自定义色板及收藏。
- **设计留档**：保存、重命名、分页查看和删除换色历史，并提供将设计同步到商品的接口。

## 实际采用的技术栈

1. **前端框架与语言**：Next.js `15.1.0` App Router、React/React DOM `19.0.0`、TypeScript `5.7.2`；主要业务模块通过 `next/dynamic` 延迟加载。依据：[frontend/package.json](<D:/desktop/clothesHub/frontend/package.json:1>)、[app/page.tsx](<D:/desktop/clothesHub/frontend/src/app/page.tsx:31>)。
2. **界面与图表**：Tailwind CSS `^4.3.1`、Lucide React `0.460.0`、Recharts `^3.9.1`；界面为响应式 React 组件。依据：[frontend/package.json](<D:/desktop/clothesHub/frontend/package.json:12>)、[globals.css](<D:/desktop/clothesHub/frontend/src/app/globals.css:1>)。
3. **客户端状态与请求**：Zustand `5.0.2`（持久化登录状态）、Axios `1.7.9`（API 请求及认证拦截）、`react-markdown` 与 `remark-gfm`（助手消息渲染）。依据：[frontend/package.json](<D:/desktop/clothesHub/frontend/package.json:8>)、[auth.ts](<D:/desktop/clothesHub/frontend/src/lib/auth.ts:1>)。
4. **后端与 API**：Python FastAPI（requirements 标注 `>=0.141.1`）、Uvicorn（`>=0.30.0`）、Pydantic 2 系列；按业务拆分路由。SSE 使用 `sse-starlette`（`>=2.0.0`）。这些是依赖声明，不代表在此处检测过的安装版本。依据：[backend/requirements.txt](<D:/desktop/clothesHub/backend/requirements.txt:1>)、[main.py](<D:/desktop/clothesHub/backend/main.py:142>)。
5. **持久化与身份验证**：SQLAlchemy `2.0.35`、SQLite（默认 `backend/auth.db`）、JWT/PyJWT `2.9.0`、bcrypt `4.2.0`；前端实现 access/refresh token 续期流程。依据：[requirements.txt](<D:/desktop/clothesHub/backend/requirements.txt:4>)、[database.py](<D:/desktop/clothesHub/backend/database.py:21>)、[jwt_handler.py](<D:/desktop/clothesHub/backend/auth/jwt_handler.py:1>)。
6. **采集、AI 与图像处理**：独立数据服务使用 httpx、Playwright 与 Chromium CDP；AI 接口通过 OpenAI SDK 的异步兼容客户端和工具调用；颜色模块依赖 PyTorch、Transformers、OpenCV、NumPy、Pillow。均是源码/依赖可见的实现路径，外部采集登录态及模型/API 配置决定运行时是否可用。依据：[data-service/requirements.txt](<D:/desktop/clothesHub/data-service/requirements.txt:1>)、[ai_assistant/router.py](<D:/desktop/clothesHub/backend/ai_assistant/router.py:71>)、[backend/requirements.txt](<D:/desktop/clothesHub/backend/requirements.txt:7>)。

## 开发说明

- **页面组织**：真正的 Next 页面路由目前只有 `/`、`/login`、`/register`、`/forgot-password`；后台功能模块在 `/` 页面内部按 `activePage` 切换。侧栏的 14 项模块均映射到对应组件，仪表盘、店铺、商品、订单、供应链、选品、营销、商品制作、分析、任务、财务、客户、合同、消息均有组件；个人资料和系统设置由账户菜单进入。未知模块才显示通用“开发中”占位。源码：[app/page.tsx](<D:/desktop/clothesHub/frontend/src/app/page.tsx:64>)、[app/page.tsx](<D:/desktop/clothesHub/frontend/src/app/page.tsx:503>)。
- **前后端边界**：业务请求通过 Next rewrite 转发到 `localhost:8000`，上传资源也转发到后端；主后端在启动时建表并注册业务路由。数据库默认 SQLite 文件路径由 `backend/database.py` 声明。源码：[next.config.ts](<D:/desktop/clothesHub/frontend/next.config.ts:8>)、[backend/main.py](<D:/desktop/clothesHub/backend/main.py:172>)、[database.py](<D:/desktop/clothesHub/backend/database.py:21>)。
- **演示数据**：`backend/seed_data.py` 是使用说明指向的业务演示数据脚本，并设置随机数种子；它不会由当前 `backend/main.py` 自动调用。主后端 lifespan 自动建表并运行颜色库 seed，需自行按使用说明运行演示数据脚本。若复用已有 `auth.db`，内容可能是之前留下的本地数据，本次没有检查数据库。源码：[seed_data.py](<D:/desktop/clothesHub/backend/seed_data.py:268>)、[backend/main.py](<D:/desktop/clothesHub/backend/main.py:47>)、[backend/main.py](<D:/desktop/clothesHub/backend/main.py:104>)；启动说明：[使用说明.md](<D:/desktop/clothesHub/使用说明.md:56>)。
- **外部能力边界**：选品采集器保留真实请求/浏览器自动化实现，也在失败路径中写入回退数据；AI 助手同样要求有效模型配置。为面试演示时，建议把“可配置的真实集成”和“默认回退/模拟响应”明确分开，并避免使用代码本身无法证明的准确率、耗时、产出或用户规模数字。源码：[data-service/main.py](<D:/desktop/clothesHub/data-service/main.py:143>)、[douyin_index.py](<D:/desktop/clothesHub/data-service/fetchers/douyin_index.py:179>)、[ai_assistant/router.py](<D:/desktop/clothesHub/backend/ai_assistant/router.py:311>)。

## 运行与演示素材速查

### 作品页截图核验补充（2026-10-19）

作品页使用独立副本实际运行前后端，未复用原始数据库、环境文件或上传资料。业务数据由 `seed_data.py` 在空库中生成，账号显示名已替换为“演示运营员”。共截取经营总览、商品、订单、供应链、客户、财务、选品利润测算、颜色库和助手入口九张 1600 × 960 截图，并生成 960 × 576 WebP 预览。选品利润测算实际调用返回 200 并显示结果；颜色库实际加载 77 种颜色。未进行服装模型推理或配置外部 AI 服务，因此相关界面只作为工作台展示，不声称已验收模型效果。趋势采集服务未启动，截图采用可直接运行的利润计算器。

运行时另发现记账列表请求 `/api/accounting` 返回 404，当前截图使用正常显示的财务概览；这不属于本次博客展示页的代码修改范围。导入与换色文字依据源码核对，不能将这次截图核验表述为对全部业务能力的完整验收。

- **启动方式**：使用说明给出的本地开发入口是先在 `backend` 启动 `python -X utf8 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`，再在 `frontend` 执行 `npm run dev`，浏览器打开 `http://localhost:3000`。选品数据服务可单独在 `data-service` 运行 `python -X utf8 main.py`（端口 8100）；仅在演示依赖该服务的采集功能时启动。依赖分别见各目录 requirements 和 package manifest。
- **演示数据来源**：业务演示记录来自 `backend/seed_data.py`，使用说明要求在后端启动建表后手动运行该脚本。自动启动仅填充颜色库，不自动填业务数据。种子脚本设置 `random.seed(42)`；不要把演示记录描述成真实客户/商家数据。
- **主要路由**：页面 URL 为 `/`、`/login`、`/register`、`/forgot-password`；`/` 中的模块导航不是独立 URL。后端主接口涵盖 `/api`、`/api/products`、`/api/orders`、`/api/stores`、`/api/supply`、`/api/customers`、`/api/contracts`、`/api/messages`、`/api/analytics`、`/api/finance`、`/api/accounting`、`/api/marketing`、`/api/insight`、`/api/tasks`、`/api/ai`、`/api/colors`；API 文档可在本地服务运行后访问 `/docs`。
- **可复用截图/图片**：按扩展名扫描 ClothHub 项目时，没有找到仪表盘、表格或模块 UI 截图；发现 `backend/uploads/design_1_418fc089.jpg` 一张设计/换色输出图片，可作为产品图片素材参考，但它不是界面截图。建议隔离运行前端和后端后自行截取首页、订单列表、选品页与换色结果。


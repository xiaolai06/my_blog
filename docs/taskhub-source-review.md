# TaskHub 源码审阅与作品页改写建议

审阅对象：`D:\desktop\heikesong`（智汇轻营 TaskHub）  
审阅方式：只读静态检查源码和配置；未运行或修改 TaskHub，未读取 `.env`、数据库文件、WAL/SHM 文件或任何实际业务数据。README 仅用来定位项目名称与入口，以下功能结论均以实际界面、路由、服务层和数据模型为依据。

## 项目定位

TaskHub 是面向个人工作室与小型服务团队的项目经营工作台。源码中能确认的主线是：建立项目/订单，拆分和跟踪任务，查看规则生成的排期，录入项目成本与回款，维护客户资料，并借助 AI 助手和定时任务处理查询、提醒与摘要。

界面品牌使用“智汇轻营 / TaskHub”；后端 package 描述仍有旧名“TaskFlow+”，作品页建议统一使用 TaskHub，不沿用后端包名。整体叙事可落在“项目从签约信息到执行、成本和回款的日常管理”，避免写成完整 ERP、会计或资源调度平台。

## 建议的作品页首屏

**标题：** 智汇轻营 TaskHub｜个人工作室的项目经营工作台

**简介：** 把客户、项目、任务排期、成本与回款放到同一条工作流里。用看板和甘特图跟进执行，用项目维度查看已记录的成本与收款，再通过 AI 问答和定时提醒快速定位下一步。

**建议主流程：** 建客户 → 建项目并填写预算与周期 → 拆分任务并估工时 → 查看排期、确认后写回任务日期 → 登记项目成本和回款 → 从总览、报表或 AI 助手检查进展。

页面用“已录入的数据”“排期建议”“可配置的通知”等词，准确体现当前系统的工作方式。演示截图应使用主代理准备的隔离演示数据，不应暴露真实客户、任务、收支或模型配置。

## 模块式作品页内容建议

### 1. 项目 / 订单管理

**用途：** 以一个项目承载客户关系、报价预算、执行周期和工作内容。  
**用户操作：** 新建或编辑项目，填写名称、状态、预算、起止时间、关联客户及说明；进入详情查看项目摘要、任务和成本记录。  
**结果：** 项目页展示预算、日期、任务数量和已登记成本；服务端按预算减去已登记成本计算一个项目余额/利润字段，便于日常查看。  
**作品页文案：**「从客户与报价建立项目，把执行任务和成本记录归到同一个项目下；打开项目即可查看周期、进度与已记录支出。」  
**源码证据：** `frontend/src/components/features/projects/ProjectForm.tsx:133-218`；`frontend/src/app/main/projects/[id]/page.tsx:177-219, 272-322`；`backend/src/services/project.service.ts:63-80, 83-139`。

### 2. 任务与子任务

**用途：** 将项目工作拆成可跟进的任务，并维护状态、优先级、预估/实际工时、起止日期和阻塞原因。  
**用户操作：** 从任务页或项目详情创建、编辑、筛选任务；用看板、列表或甘特视图查看状态；需要时建立父子任务。  
**结果：** 用户能在项目中查看任务清单；父任务的进度可按已完成子任务比例更新。  
**作品页文案：**「把项目拆成带优先级、工时与截止日期的任务，在看板、列表和甘特视图之间切换；子任务完成后，父任务进度随之更新。」  
**源码证据：** `frontend/src/app/main/tasks/page.tsx:35-114, 234-253, 331-435`；`frontend/src/app/main/projects/[id]/page.tsx:272-322`；`backend/prisma/schema.prisma:115-146`；`backend/src/services/task.service.ts:183-237`。

### 3. 规则排期与甘特图

**用途：** 根据未完成任务的优先级、截止/开始日期、剩余估算工时和每日工时上限，生成个人工作日排期。  
**用户操作：** 选择项目、设定每日工时上限、查看日/周/月甘特视图及负荷、延期和冲突摘要；点击“应用排期”后，将建议日期写回任务。也可以输入一个虚拟任务，先模拟插入后的排期影响。  
**结果：** 得到一个便于人工审阅的时间安排；接受后，各任务的开始日和截止日被保存。  
**作品页文案：**「根据任务优先级、预估工时和每日容量生成工作日排期，先查看负荷与延期，再把建议日期应用到任务。」  
**源码证据：** `backend/src/services/scheduler.service.ts:145-198, 220-318, 413-505, 547-558, 568-690`；`frontend/src/app/main/tasks/page.tsx:120-145, 149-175`；`frontend/src/components/features/schedule/InsertionDialog.tsx:63-108`。

### 4. 项目成本、流水与回款

**用途：** 记录项目花费、日常收支和客户回款；按项目展示已录入成本、预算与应收余额。  
**用户操作：** 在项目中新增成本记录，在财务页分别维护流水、回款与订阅；回款记录可关联项目。成本与回款服务会同步生成对应流水，流水页提供筛选。  
**结果：** 页面根据当前手工录入的数据汇总已收、待收、回款率、成本和订阅月度估算；财务报表可辅助日常经营回顾。  
**作品页文案：**「把项目支出和回款记在对应项目下，并在财务页汇总流水、应收和订阅支出，让报价与实际记录有据可查。」  
**源码证据：** `frontend/src/app/main/finance/page.tsx:11-72`；`frontend/src/components/features/finance/PaymentTab.tsx:139-195`；`frontend/src/components/features/finance/SubscriptionTab.tsx:218-230`；`backend/src/services/cost.service.ts:35-104`；`backend/src/services/payment.service.ts:31-74, 80-154, 161-190`；`backend/src/services/transaction.service.ts:57-96`；`backend/src/services/subscription.service.ts:94-123`。

### 5. 客户资料与跟进

**用途：** 保存客户联系资料、状态和备注，并关联客户的项目及最近沟通/下次跟进时间。  
**用户操作：** 在客户页搜索、筛选和编辑客户；AI 工具可以记录沟通内容并设置下次跟进时间；跟进报表按到期和未来七天列出提醒。  
**结果：** 客户资料页显示关联项目摘要和最近沟通信息，报表汇总待跟进事项。  
**作品页文案：**「维护客户档案并关联合作项目；记录沟通和下次跟进日期后，可在客户报表集中查看待处理事项。」  
**源码证据：** `frontend/src/components/features/customers/CustomerForm.tsx:132-184`；`backend/src/services/customer.service.ts:34-112, 119-168`；`backend/src/ai/tools/get-client-follow-up.ts:145-149`；`backend/src/services/report.service.ts:585-646`；`frontend/src/components/features/reports/CustomerTab.tsx:91-113`。

### 6. AI 助手

**用途：** 通过自然语言查询项目、任务、客户、成本、回款、订阅、目标等业务信息；部分对话可触发对应的业务工具。  
**用户操作：** 在 AI 面板切换已配置的模型/供应商，发送问题并查看流式回复、工具调用结果和历史会话。AI 排期按钮会把现有排期摘要发送给模型，让模型返回建议。  
**结果：** 在供应商与模型可用时，用户可在对话中获得业务查询或建议；工具会按当前请求执行并回传结果。  
**作品页文案：**「用对话查询项目与经营数据，并让助手基于当前排期给出建议；可调用的业务操作取决于工具和模型配置。」  
**源码证据：** `frontend/src/components/features/ai/AiPanel.tsx:51-175, 276-331`；`backend/src/routes/llm.routes.ts:121-219, 251-273`；`backend/src/ai/tools/registry.ts:76-95`；`backend/src/ai/tools/tool-router.ts:233`；`backend/src/services/ai.service.ts:178-254, 264-270, 340-374`；排期建议见 `frontend/src/app/main/tasks/page.tsx:149-173`。

### 7. 定时提醒与周期摘要

**用途：** 在后端进程运行并启用任务时，定期扫描工作数据、创建站内通知或生成 AI 摘要。  
**用户操作：** 查看系统任务，创建定时通知或 AI 分析任务，启停任务、查看执行历史；通知可按配置尝试发邮件或 webhook。  
**结果：** 站内生成逾期任务提醒、成本预警、晨间简报、客户雷达、周报等；外部邮件/webhook 需要额外完成渠道配置。  
**作品页文案：**「为逾期任务、成本阈值和周期回顾配置提醒；支持站内通知，并可按需接入邮件或 webhook 渠道。」  
**源码证据：** `backend/src/services/cron-job.service.ts:1-103, 184-256`；`backend/src/jobs/index.ts:1-22`；`backend/src/server.ts:44-59`；`backend/src/jobs/due-reminder.job.ts:11-60`；`backend/src/jobs/cost-alert.job.ts:11-38`；`backend/src/jobs/custom-job.executor.ts:108-153, 221-255`；`backend/src/utils/push-helper.ts:22-81`；`backend/src/routes/cron-job.routes.ts:90-188`。

### 8. 总览与经营报表

**用途：** 把项目、任务、回款和客户跟进状态做成日常查看入口。  
**用户操作：** 从仪表盘查看项目/任务摘要，进入报表页查看逾期、应收和客户跟进；需要深入处理时跳回对应项目、任务或客户。  
**结果：** 用户能从汇总信息定位需要继续跟进的对象；报表显示的是系统中已录入的数据及代码定义的统计口径。  
**作品页文案：**「从一页总览定位逾期任务、待收款和客户跟进，再进入对应记录继续处理。」  
**源码证据：** `frontend/src/app/main/dashboard/page.tsx:224-226, 335`；`frontend/src/components/features/reports/TaskTab.tsx:125-189`；`frontend/src/components/features/reports/FinanceTab.tsx:96-138, 200-209`；`frontend/src/components/features/reports/CustomerTab.tsx:91-113`；`backend/src/services/report.service.ts:342-378, 585-646`。

## 架构与实现方式

- **前端：** Next.js App Router 与 React，页面将功能拆到项目、任务、客户、财务、AI、排期和报表组件中。任务与项目等常用数据由 hooks 请求后端 API。
- **后端：** Express 路由分组后调用 service 层，再通过 Prisma 访问 SQLite。`backend/src/routes/index.ts` 为业务路由挂载认证和 API 限流；`backend/prisma/schema.prisma` 中 Project、Task、Customer、Payment、Transaction、Communication 等模型通过关系连接。
- **用户隔离：** 业务查询普遍按当前用户 ID 或项目 owner 查询；认证中间件支持 JWT cookie。此处只确认源码结构，不等同于安全审计或生产环境验证。
- **AI 接入：** 服务从用户设置读取供应商、模型、Base URL 和加密保存的密钥，再创建 OpenAI-compatible 客户端。未配置模型时聊天进入有限的 Mock 路径；定时 AI 分析在未配置时会失败并记录执行错误。
- **定时任务：** 使用 node-cron 在后端进程内注册和运行，不是外部队列或托管调度平台。后端配置允许关闭 cron；因此演示与部署都需要进程持续运行且对应设置开启。

**源码证据：** `frontend/package.json`；`backend/package.json`；`backend/src/app.ts:13-123`；`backend/src/routes/index.ts:51-76`；`backend/src/middleware/auth.ts:51`；`backend/prisma/schema.prisma:7-8, 84-146, 168-198, 486-554, 579-644`；`backend/src/services/ai.service.ts:178-254, 386-411`；`backend/src/server.ts:44-70`。

## 作品页不要夸大的实现边界

1. **排期不是 AI 优化器。** 排期核心是本地确定性规则：计算剩余工时，按优先级/截止日期排序，受开始日期、每日工时上限和周末跳过规则影响。AI 按钮将已有排期摘要发给模型，请模型给出文字建议；不应写成 AI 自动重排、团队资源均衡或依赖关系求解。当前没有证据表明排期会读取法定节假日、人员可用时间或任务依赖。
2. **插入模拟不会创建任务。** 插入弹窗明确写着“不会真正创建任务”；结果只比较虚拟任务加入后日期的变化。不能把它宣传成任务创建或自动调整计划。
3. **逾期/冲突探测有筛选条件。** `detectDelays` 只查未完成、逾期且 actualHours 非空的任务；冲突分析也对任务字段有筛选条件。概述可以说“提供逾期/负荷提示”，不能保证覆盖所有逾期或所有排期风险。
4. **财务是人工记录的管理汇总。** 回款由用户录入；应收由项目预算减去已录入回款估算，成本来自成本记录及部分任务成本。没有证据支持银行同步、支付处理、发票/税务、审计级记账或外部财务系统对账。交易、财务总览与报表存在各自的统计实现，不要写“财务数据已完全自动对账”。
5. **订阅自动记账尚未接入定时器。** 已有订阅的新增、暂停/恢复和月/年金额估算；`processDueSubscriptions` 中也有到期生成流水的逻辑，但全局源码搜索只发现该函数定义，没有发现它被 jobs 注册或调用。因此可说“管理订阅和估算经常性支出”，不应承诺到期自动扣款或自动记账。
6. **客户沟通不是普通档案表单里的独立操作。** 常规客户表单维护联系人和备注；沟通记录及 nextFollowAt 写入逻辑出现在 AI 工具中，跟进报表读取这些日期。作品页若展示跟进，最好用真实可验证的沟通记录流程或截图来表达。
7. **AI 写操作缺少实际确认门。** 工具类型带有 requiresConfirmation 标记，设置页可以保存 tool_permission；但流式路由构造的系统提示要求模型直接执行写操作，AIService 会直接调用工具 handler。未发现这些写操作在服务端等待用户确认的执行路径；ToolConfirmDialog 组件也未发现被 AI 面板引用。不能宣传“每次写入都需用户确认”或“危险操作有二次确认”。在正式强调 AI 写入能力前，建议单独修复/验证这条安全路径；当前对外文案可先强调查询与建议。
8. **定时提醒依赖本机服务和集成配置。** 定时任务跑在后端进程里，AI 分析需要可用的模型设置；邮件依赖 SMTP，webhook 依赖用户配置。提醒任务未必会在进程停止时补跑。自定义执行器目前只处理 NOTIFY 与 AI_ANALYSIS；虽然数据模型里有 WEBHOOK action 字段，但不能据此宣称支持自定义 webhook 动作。
9. **自定义时区不要泛化。** 自定义任务表单保存 Asia/Shanghai，执行器注册时也固定使用 Asia/Shanghai；不能宣传为已支持任意时区定时执行。
10. **不要填充未经证实的成效数字。** 不要把 README 或代码中的工具数、模型/表数量写成效率提升、准确率、节省时间或用户规模。这个静态审阅没有使用真实数据、运行验收或产品指标。

## 主要证据索引

| 主题 | 可复核源码 |
| --- | --- |
| 产品命名 | `frontend/src/components/layout/Sidebar.tsx:92-93`；`frontend/src/app/layout.tsx:9-14`；对照：`backend/package.json:4` |
| 前后端入口与路由 | `backend/src/app.ts:13-123`；`backend/src/routes/index.ts:51-76` |
| 数据模型 | `backend/prisma/schema.prisma:7-8, 84-146, 168-198, 486-554, 579-644` |
| 项目成本与利润字段 | `backend/src/services/project.service.ts:63-80, 126-150`；`backend/src/services/cost.service.ts:35-104` |
| 任务与父子进度 | `backend/prisma/schema.prisma:115-146`；`backend/src/services/task.service.ts:183-237` |
| 排期与模拟 | `backend/src/services/scheduler.service.ts:145-198, 220-318, 413-505, 568-690`；`frontend/src/app/main/tasks/page.tsx:129-173` |
| 客户与跟进 | `frontend/src/components/features/customers/CustomerForm.tsx:132-184`；`backend/src/services/customer.service.ts:34-112, 119-208`；`backend/src/ai/tools/get-client-follow-up.ts:145-149`；`backend/src/services/report.service.ts:585-646` |
| 财务 | `frontend/src/app/main/finance/page.tsx:11-72`；`backend/src/services/payment.service.ts:31-74, 80-190`；`backend/src/services/transaction.service.ts:57-96`；`backend/src/services/subscription.service.ts:94-160` |
| AI 与工具执行 | `frontend/src/components/features/ai/AiPanel.tsx:51-175, 276-331`；`backend/src/routes/llm.routes.ts:121-219, 251-273`；`backend/src/services/ai.service.ts:340-374`；`backend/src/ai/tools/types.ts:15` |
| 周期任务与通知 | `backend/src/services/cron-job.service.ts:1-103, 184-256`；`backend/src/jobs/index.ts:1-22`；`backend/src/jobs/custom-job.executor.ts:108-153, 221-255`；`backend/src/utils/push-helper.ts:22-81` |
| 仪表盘与报表 | `frontend/src/app/main/dashboard/page.tsx:224-226, 335`；`frontend/src/components/features/reports/TaskTab.tsx:125-189`；`frontend/src/components/features/reports/FinanceTab.tsx:96-138, 200-209`；`frontend/src/components/features/reports/CustomerTab.tsx:91-113` |

本审阅只验证了代码中存在相应界面和逻辑；动态运行表现、演示数据是否正确及页面视觉效果应以主代理在隔离演示环境中的实际检查为准。

export interface Project {
 slug:string; name:string; subtitle:string; category:string; description:string; color:string; cover:string;
 tags:string[]; stack:{name:string; detail:string}[]; features:{title:string; text:string}[];
 challenge:string; approach:string; flow:string[]; highlights:{title:string; text:string}[];
 limits:string[]; sources:string[]; takeaway:string;
 online?:{url:string;label:string;note:string};
 reviewedAt?:string; detailsTitle?:string; detailsIntro?:string;
 coverAlt?:string; coverCaption?:string;
}
export const projects:Project[] = [
{
 slug:'orulink', name:'ORULINK', subtitle:'拾光校园 · 软硬件协同的校园智能伙伴', category:'校园生活',
 description:'基于 WatcheRobot 桌面机器人，把校园学习工作区、AI 助手与语音、表情和动作交互连接起来。',
 color:'teal', cover:'/images/orulink.webp', tags:['React + Express','Python','机器人 SDK'],
 reviewedAt:'2026-10-20',detailsTitle:'软硬件协同与实现细节',
 detailsIntro:'从网页里的课程安排，到桌面上的提醒与互动，关键是让业务数据、设备权限和执行状态相互对应。项目围绕现有机器人产品开发应用与连接软件，同时处理硬件能力差异和异常恢复。',
 stack:[{name:'React 19 + TypeScript + Vite 6',detail:'模块化网页工作区，组织课程、任务、日历、助手及设备控制界面。'},{name:'Express 4 + SQLite',detail:'Node 内置 node:sqlite 持久化业务记录，配合事务、外键与账号权限管理。'},{name:'共享 Zod Schema',detail:'前后端共用数据结构与校验约束，连接校园业务、助手工具和设备接口。'},{name:'Python + FastAPI + WebSocket',detail:'本机 connector 接收业务命令，通过托管 worker 与官方 Runtime 通信，隔离网页与硬件 SDK。'},{name:'WatcheRobot SDK + ASR / TTS',detail:'基于 watcherobot 0.1.10 接入动作、表情、音频和摄像头；语音识别与合成使用可配置服务。'}],
 features:[
  {title:'课程、项目与待办',text:'管理教学周、周期课程、单次调课、项目成员和层级任务，配合学习计时安排日常工作。'},
  {title:'统一日历与消息',text:'聚合课程、任务和活动，提供日、周、月及列表视图，并组织校园订阅和提醒。'},
  {title:'校园生活记录',text:'管理社团活动、资料目录、生活账本与 Markdown 日记，保留日记历史版本。'},
  {title:'连接业务的 AI 助手',text:'通过已注册工具查询和处理账号内业务，流式呈现回答、来源与操作反馈。'},
  {title:'机器人动作与表情',text:'网页控制转头、点头、摆动和屏幕表情；动作执行以中心角确认、授权和任务回执为前提。'},
  {title:'语音对话与陪伴',text:'串联唤醒、语音活动检测、ASR、账号助手、TTS 与设备播放，提供安静、活泼、鼓励等互动预设。'},
  {title:'摄像头与媒体',text:'接入拍照、实时画面、无声录像、录音与播放；人脸跟踪使用位置反馈，不识别个人身份。'},
  {title:'桌面提醒场景',text:'围绕课前、任务截止和手动定时提醒，将学习安排转为设备播报与表情反馈，受登录和设备授权约束。'},
 ],
 challenge:'校园记录与桌面交互原本处于两个独立入口：网页知道课程和任务，机器人具备声音、屏幕和动作能力。项目基于 WatcheRobot 产品设计校园伙伴应用，让学习安排与实体设备协同；同时解决设备断连、权限变化、语音阶段和执行回执不一致的问题。',
 approach:'采用校园业务层与本机设备层分离的结构。React 呈现工作区，Express 处理账号、领域数据与设备授权，SQLite 保存记录；机器人命令经 Python connector 和托管 worker 进入官方 Runtime/SDK。设备状态与事件回传网页，业务数据通过受限助手工具使用。',
 flow:['Web 工作区 / 业务 API','本机 Python connector','托管 worker / Runtime','SDK / 桌面机器人'],
 highlights:[
  {title:'基于产品能力设计嵌入式交互场景',text:'将课前提醒、任务截止、学习陪伴和问答映射到机器人的声音、表情与轻动作。嵌入式场景的工作集中在应用逻辑、设备接入和交互协同；机器人本体与底层固件由厂商产品提供。'},
  {title:'隔离设备依赖，保留能力判断',text:'网页通过业务接口控制设备，不直接依赖 SDK。本机连接层负责 Runtime 通信与媒体处理，依据设备上报能力开放功能；未知或过期的电量、连接与执行状态明确显示，避免把未上报当成成功。'},
  {title:'把指令当作有生命周期的任务',text:'命令绑定登录会话、授权版本、设备连接代际和 worker 代际，执行前再次核对。区分已受理、执行中、完成和未知结果；切换动作先取消旧任务，无法确认释放时阻止继续叠加。'},
  {title:'让语音状态与实际执行对应',text:'从倾听、识别、思考、合成到播报显示阶段状态。当前采用半双工，播报时暂停录音，结束后恢复倾听；前台续期与超时释放控制采集窗口，失败时保留可读文字并显示恢复入口。'},
  {title:'在多个入口间复用业务记录',text:'工作台与日历聚合课程、任务等领域记录，课程周期规则与单次例外分开维护。助手复用账号业务服务，设备提醒围绕已有安排触发，减少重复登记和不同入口之间的数据脱节。'},
 ],
 limits:['网页已从当前源码实际启动，截图使用独立演示账号与数据；本次未连接机器人或验证模型服务，硬件效果仍需实机验收。','硬件部分为 WatcheRobot Runtime/SDK 应用集成；未将自研电路、MCU 固件、RTOS 或具体机器人型号作为项目成果。','当前按本机会话连接单设备槽位，尚无永久序列号绑定、多机器人管理、自动机械归零或全双工语音打断。','语音、动作、摄像头和提醒受实际固件能力、校准、模型配置、登录及授权状态影响；资料目录不等于文件解析，课程未接教务系统同步。'],
 sources:['apps/web/src/app/router.tsx','apps/server/src/modules/devices/service.ts','apps/server/src/modules/devices/voice.ts','apps/robot-connector/src/orulink_connector/main.py','apps/robot-connector/src/orulink_connector/adapters.py','apps/robot-app-managed/app.py','contracts/robot/v1/sdk-baseline.json','docs/robot/README.md','docs/robot/TESTING.md'],
 takeaway:'从网页中的一项安排，到桌面上的一次回应，让软件与设备协同工作。'
},
{
 slug:'taskhub',name:'TaskHub',subtitle:'智汇轻营 · 一人公司的经营工作台',category:'经营管理',
 online:{url:'https://xiaolai.duckdns.org/',label:'访问在线工作台',note:'进入智汇轻营，登录后查看项目、任务与经营功能。'},
 description:'从项目排期到客户与回款，把独立经营中的琐碎事务放回一个有序的工作台。',
 color:'violet',cover:'/images/taskhub.webp',tags:['Next.js 16','Prisma','AI Tools'],
 stack:[{name:'Next.js 16 + React 19',detail:'Tailwind CSS 4 与 Base UI 构建界面，提供看板、列表和甘特等业务视图。'},{name:'React Query + Zustand',detail:'区分服务端数据查询缓存与本地界面状态，组织不同类型的数据。'},{name:'Express 5 + Prisma 6',detail:'按业务模块组织 API，由 Prisma 访问 SQLite 数据库。'},{name:'SSE + node-cron',detail:'流式 AI 工具调用；后端进程内执行定时提醒和经营简报。'}],
 features:[{title:'项目与任务',text:'项目、客户、目标、看板、列表及甘特视图，串联日常经营。'},{title:'智能排期',text:'依据逾期、优先级与截止日期安排任务，支持冲突检测和插单模拟。'},{title:'财务与报表',text:'流水、回款、订阅和应收管理，汇总趋势及经营情况。'},{title:'工具型助手',text:'通过注册的业务工具查询或修改数据，并提供定时提醒入口。'}],
 challenge:'独立经营者经常在项目交付、客户沟通和回款之间切换。一个好看的任务列表还不够，排期需要考虑实际工时与临时插单，经营数据也需要彼此关联。',
 approach:'以前后端分层组织业务：Next.js 呈现多种视图，Express 服务处理排期、财务与 AI 工具，Prisma 统一数据访问；提醒任务在后端进程内运行。',
 flow:['Next.js 多视图','Express 业务服务','Prisma + SQLite','AI 工具 / 定时任务'],
 highlights:[{title:'排期可以预演',text:'排期服务结合任务状态、优先级、截止日期与每日工时限制，支持冲突检测和插单模拟。'},{title:'让对话进入真实业务',text:'SSE 对话串联工具筛选、用户记忆及工具执行；当前注册表列出 96 个工具，数量以源码为准。'},{title:'把经营提醒放进日常',text:'定时任务包含到期提醒、成本预警、晨间简报与周报等入口，围绕已有业务记录提供信息。'}],
 limits:['AI、语音、搜索、邮件或 Webhook 依赖相应服务配置与网络。','当前 AI 流式调用路径直接执行工具，不应描述为已实现写操作前确认。','已提供公开访问入口；具体业务功能需登录，未据此推断用户规模或生产性能。'],
 sources:['frontend/package-lock.json','backend/prisma/schema.prisma','backend/src/services/scheduler.service.ts','backend/src/ai/tools/registry.ts','backend/src/routes/llm.routes.ts','backend/src/jobs/index.ts'],
 takeaway:'让排期、执行与经营形成闭环，才是工作台的真正意义。'
},
{
 slug:'clotheshub',name:'ClothHub',subtitle:'智汇衣链 · 服装电商运营工作台',category:'经营管理',
 description:'连接商品、订单与供应链，用数据辅助选品，也为服装视觉探索更多可能。',
 color:'sand',cover:'/images/clotheshub.webp',tags:['Next.js 15','FastAPI','SQLAlchemy'],
 stack:[{name:'Next.js 15 + React 19',detail:'TypeScript、Tailwind CSS 4 与 Zustand；按需载入业务模块，Recharts 展示分析。'},{name:'FastAPI + SQLAlchemy',detail:'Python API 服务处理经营业务，SQLite 保存数据。'},{name:'独立数据服务',detail:'httpx 与 Playwright 采集外部数据，部分来源有估算与回退路径。'},{name:'分割模型 + LAB 色彩',detail:'SegFormer 服装分割结合蒙版边缘处理和 LAB 色彩转换，提供换色预览。'}],
 features:[{title:'电商运营',text:'商品库存、店铺、订单、客户、营销与财务集中管理。'},{title:'供应链联动',text:'供应商采购、收货入库；订单取消与库存恢复相互关联。'},{title:'选品与分析',text:'趋势、选品矩阵、利润计算与报告，结合外部采集和回退数据。'},{title:'视觉与助手',text:'服装分割换色、多色预览，以及按页面上下文路由的 AI 助手。'}],
 challenge:'服装电商需要同时处理库存、订单、采购和视觉表达。难点是把业务状态变化连贯起来，并区分外部采集数据、估算值与演示数据。',
 approach:'主后端承载商品和经营逻辑，数据采集与图像处理分别组织；前端按业务模块切换，让同一工作台覆盖运营流程。',
 flow:['Next.js 运营界面','FastAPI 业务层','SQLAlchemy + SQLite','数据采集 / 换色引擎'],
 highlights:[{title:'业务动作联动库存',text:'采购收货增加商品库存；订单取消触发库存恢复，业务动作与数据状态保持关联。'},{title:'有来源边界的数据辅助',text:'选品数据同时存在外部采集、数据库均价和回退估算；展示时需要说明来源，不把回退值当成实时事实。'},{title:'把视觉处理融入运营',text:'服装区域分割后进行蒙版边缘处理，支持单色、多部位换色与多色预览；AI 助手按关键词和页面上下文选择专业角色。'}],
 limits:['项目为开发阶段原型，含种子演示数据；未确认公开部署或真实用户数据。','外部平台采集依赖页面结构、公开接口与登录状态，部分结果会回退为估算。','AI 依赖用户模型配置；未配置时有模拟回复。角色路由并不等于已验证的自主多 Agent 协作。'],
 sources:['frontend/package.json','backend/database.py','backend/supply/router.py','backend/orders/router.py','backend/insight/router.py','backend/ai_assistant/agents.py','backend/colors/image_processor.py'],
 takeaway:'工具的价值，来自业务流程里的每一次可靠衔接。'
},
{
 slug:'student-score',name:'学绩',subtitle:'学生成绩管理 · 教学数据处理平台',category:'校园生活',
 description:'从教师的表格整理需求出发，完成名单匹配、成绩清洗、异常核对与统计导出，让每次数据更新有据可查。',
 color:'teal',cover:'/images/student-score.svg',coverAlt:'学绩学生成绩管理的数据处理流程示意：导入、核验、统计与导出',coverCaption:'数据处理流程示意，非运行截图',
 tags:['FastAPI','SQLite','数据清洗'],reviewedAt:'2026-10-20',
 online:{url:'https://sz-yiban.duckdns.org/',label:'查看在线平台',note:'进入“学绩 · 学生成绩管理”查看平台内容；可访问范围以站点设置为准。'},
 detailsTitle:'数据处理与问题解决',detailsIntro:'这个项目的重点是把表格中的具体问题转成明确的处理规则：能确定的格式问题自动规范，不能确定的异常交给人工核对，提交与撤销都检查数据是否已经变化。',
 stack:[{name:'原生 JavaScript + HTML / CSS',detail:'按页面与控制逻辑拆分模块，呈现导入向导、学院班级目录、成绩明细和统计总览。'},{name:'Python + FastAPI + Uvicorn',detail:'处理文件上传、字段映射、预览提交、筛选、导出及备份接口，使用 Pydantic 校验请求。'},{name:'SQLite + 事务 / 版本号',detail:'保存学院、班级、学生当前成绩与批次审计，revision 与行版本用于检查预览过期和撤销冲突。'},{name:'CSV / TSV / XLS / XLSX',detail:'识别编码、分隔符与工作表结构，实施数据清洗和学号精确匹配，导出 CSV 与分班 Excel。'}],
 features:[
  {title:'名单与班级管理',text:'导入 XLS/XLSX 名单，识别表头或手动映射字段，建立学院—班级—学生目录，预览后更新或跳过已有人员。'},
  {title:'多格式成绩导入',text:'处理 CSV、TSV、XLS 和 XLSX，选择工作表、表头、字段及得分率比例，先生成预览再决定写入。'},
  {title:'清洗、校验与匹配',text:'规范全角、空白和明确的学号格式问题，按学号精确匹配；姓名冲突、无效分值和不可恢复的学号精度问题单独提示。'},
  {title:'重复与增量更新',text:'合并相同重复行，按规则处理安全的高分合并，阻止无法判断的同号冲突，保护已完成成绩不被未完成记录降级。'},
  {title:'明细与待跟进',text:'按学院、班级、姓名、学号、状态及得分率筛选，支持排序、分页和编辑，集中定位未录入、未完成与异常情况。'},
  {title:'统一口径的数据总览',text:'查看学生、学院、班级与合格人数。得分率达到 90%（含 90%）按项目规则计为合格，进度状态与成绩口径分开呈现。'},
  {title:'按范围导出',text:'导出勾选学生、当前筛选、学院或班级范围，生成 CSV 或分班工作表 Excel，统计覆盖全部筛选结果而非当前页。'},
  {title:'批次、撤销与备份',text:'保存导入批次和异常记录，支持有条件的整批撤销、数据库备份，以及预览确认后的名单剔除。'},
 ],
 challenge:'根据教师提出的名单、成绩整理与查看要求，设计一个轻量的网页平台。实际难点在表格数据本身：文件格式和编码不同、学号格式不统一、重复行互相冲突、缺分与零分容易混淆，预览后还可能发生新的修改。需要先把这些问题定位清楚，再制定能核对、能追溯的处理规则。',
 approach:'采用“上传分析—字段映射—清洗匹配—预览确认—事务提交—统计导出”的流程。名单提供学生身份与学院班级归属，成绩按学号匹配；提交时重新检查数据库版本，写入当前成绩的同时保存批次审计，前端围绕同一套规则展示和导出结果。',
 flow:['文件分析 / 字段映射','清洗 / 匹配 / 异常预览','版本核对 / 事务提交','明细 / 汇总 / 范围导出'],
 highlights:[
  {title:'学号格式变化：规范确定项，拒绝猜测匹配',text:'清理全角、空白、隐藏字符和明确的格式尾缀；对科学计数法、公式、错误单元格和可能丢失精度的长数字学号提示异常。学生只按清洗后的学号精确匹配，姓名用于核对，不以模糊匹配代替确认。'},
  {title:'重复行与冲突：先分组，再决定是否能更新',text:'将同学号记录分组比较，同值重复可合并；存在无法安全判断的冲突或无效同号行时，阻止任意选一行覆盖。预览展示异常与变更，需明确选择处理方式后才能提交；未匹配成绩不会自动新增学生。'},
  {title:'空值与零分：保留不同的业务含义',text:'空成绩保持为空，未开始或进行中的占位零值按策略处理，真实完成零分保留。合格统计使用非空有效得分率 ≥90 的规则；已结算人数和平均值另排除未完成暂存值，使总览、筛选和导出的口径可解释。'},
  {title:'数据被再次修改：预览与撤销都检查版本',text:'预览基于同一数据库快照，提交前核对 revision 并在事务中写入，重复提交做幂等处理。撤销前检查学生后续版本，只要有记录发生冲突便整批拒绝撤销，避免旧批次覆盖新的修正。'},
  {title:'找到需要处理的人，而不只显示一个总数',text:'把未录入、未开始、进行中、已完成低于阈值及历史导入异常分开定位。查询与统计覆盖完整筛选范围；导出按勾选或筛选条件生成，并检查数据版本，避免分页和异步更新造成范围偏差。'},
 ],
 limits:['当前围绕每名学生的一份状态和得分率记录展开，导入批次用于审计；未扩展为多科目成绩、学分加权或排名系统。','90% 为该项目的合格口径，不等同于学校所有课程的及格或挂科标准。','未实现账号登录与角色权限；公网访问依赖部署侧的 HTTPS、反向代理及访问范围配置，在线环境配置未逐项审计。'],
 sources:['server/app.py','server/roster.py','server/score_import.py','server/excel_reader.py','server/score_api.py','server/grade_rules.py','server/score_export.py','server/follow_up.py','server/schema.sql','tests/test_scores.py','tests/test_score_incremental.py'],
 takeaway:'把异常找出来，把规则说清楚，让每一次更新都能够核对和追溯。'
}
];

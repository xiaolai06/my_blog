import {projects,type Project} from './projects';
import type {ProjectCase} from './project-case';

const orulink=projects.find(p=>p.slug==='orulink')!;
const score=projects.find(p=>p.slug==='student-score')!;
type Preview=ProjectCase['previews'][number];
const view=(project:Project,index:number,details:Omit<Preview,'title'|'text'>):Preview=>({title:project.features[index].title,text:project.features[index].text,...details});
const review=(p:Project)=>({date:p.reviewedAt!,limits:p.limits,sources:p.sources,takeaway:p.takeaway});
const development=(p:Project,tags:string[][])=>p.highlights.map((item,i)=>({number:String(i+1).padStart(2,'0'),...item,tags:tags[i]}));
const scoreImage=(id:string,label:string)=>({id,label,alt:`学绩 ${label}，源仓库中的虚构数据样例界面`});

export const orulinkCase:ProjectCase={
 slug:'orulink',name:'ORULINK',chineseName:'拾光校园',
 headline:['校园里的','软硬件协同智能伙伴'],
 introduction:orulink.description+' 围绕学习安排、日常记录与桌面陪伴，设计从网页业务到实体设备的完整交互流程。',
 tags:['校园智能伙伴','软硬件协同','机器人 SDK 集成'],
 media:{kind:'runtime',caption:'本地真实运行页面，独立演示账号与数据；机器人未连接',galleryNote:'截图来自 ORULINK 源码实际运行，使用独立演示数据。设备页保留未连接状态，助手未配置模型；硬件效果仍需实机验证。'},
 opening:{id:'dashboard',label:'校园工作台',alt:'ORULINK 实际运行工作台，展示演示账号的近期课程、待办计划、项目进度与快捷入口'},
 scenarios:[
  {icon:'graduation',title:'校园学习安排',text:'将课程、项目、待办与校园日历连接起来，让学习计划、单次调课和任务截止有统一入口。'},
  {icon:'message',title:'桌面陪伴与提醒',text:'基于 WatcheRobot 产品，把课前提醒、任务提示与问答映射为语音、屏幕表情及轻动作。'},
  {icon:'code',title:'嵌入式应用协同',text:'通过本机连接层协调业务服务、官方 Runtime 与设备能力，处理授权、断连及执行结果回传。'},
 ],
 previews:[
  view(orulink,0,{id:'academics',label:'课程与任务',icon:'book',eyebrow:'ACADEMICS / 学习安排',points:[
   {label:'课程规则',text:'教学周、周期课程与单次例外分开维护，保留调课后的实际安排。'},
   {label:'项目协作',text:'在项目中组织成员、层级任务与工作进度。'},
   {label:'学习计时',text:'结合待办与学习计时，让计划继续进入日常执行。'},
  ]}),
  view(orulink,1,{id:'calendar',label:'日历与消息',icon:'calendar',eyebrow:'CALENDAR / 统一时间线',points:[
   {label:'统一聚合',text:'课程、任务与活动保留各自的业务记录，在同一个日历中呈现。'},
   {label:'多种视图',text:'提供日、周、月及列表视图，按不同时间尺度查看安排。'},
   {label:'校园订阅',text:'整理校园消息、订阅与提醒，减少在多个入口之间反复查找。'},
  ]}),
  view(orulink,2,{id:'life',label:'生活记录',icon:'leaf',eyebrow:'CAMPUS LIFE / 日常整理',points:[
   {label:'社团活动',text:'管理组织资料、成员与活动安排。'},
   {label:'资料账本',text:'整理资料目录与日常收支，保持校园生活记录有序。'},
   {label:'日记版本',text:'以 Markdown 记录日常，保留历史版本供回顾。'},
  ],note:'资料目录用于组织记录，不等同于自动解析文件内容。'}),
  view(orulink,3,{id:'assistant',label:'AI 助手',icon:'sparkles',eyebrow:'ASSISTANT / 业务连接',points:[
   {label:'业务工具',text:'通过已注册工具连接账号内的课程、任务与生活记录。'},
   {label:'流式反馈',text:'逐步呈现回答、来源和工具执行结果。'},
   {label:'账号范围',text:'助手复用业务服务，数据访问遵循账号和工具权限。'},
  ]}),
  view(orulink,4,{id:'devices',label:'动作与表情',icon:'sliders',eyebrow:'ROBOT / 设备交互',points:[
   {label:'动作能力',text:'基于 SDK 控制转头、点头、摆动与回中等动作。'},
   {label:'屏幕表达',text:'通过机器人表情反馈交互阶段与操作结果。'},
   {label:'执行约束',text:'先确认中心角和授权，再跟踪命令受理、执行与完成状态。'},
  ],note:'截图为实际动作与表情控制页；机器人未连接，画面中的表情为网页预览。'}),
  view(orulink,5,{id:'voice',label:'语音对话',icon:'volume',eyebrow:'VOICE / 对话流程',points:[
   {label:'语音链路',text:'串联唤醒、VAD、识别、账号助手、合成与设备播放。'},
   {label:'阶段状态',text:'区分倾听、识别、思考、合成和播报，让等待过程可理解。'},
   {label:'半双工',text:'播报时暂停录音，结束后恢复；续期与超时释放控制采集窗口。'},
  ],note:'截图为实际语音设置页，监听未开启。识别与播报依赖 ASR / TTS 配置、Runtime 与设备能力。'}),
  view(orulink,6,{id:'media',label:'摄像与媒体',icon:'landscape',eyebrow:'MEDIA / 设备能力',image:{id:'media',label:'照片与录音',alt:'ORULINK 实际运行的照片与录音页面，设备未连接，拍照与录音控件不可用'},points:[
   {label:'摄像头',text:'接入 JPEG 拍照、实时画面与无声 MP4 录像。'},
   {label:'音频处理',text:'通过设备链路进行短时录音与音频播放。'},
   {label:'位置跟踪',text:'人脸跟踪关注画面位置，不作为个人身份识别。'},
  ]}),
  view(orulink,7,{id:'reminders',label:'桌面提醒',icon:'clock',eyebrow:'REMINDERS / 学习陪伴',image:{id:'reminders',label:'今日简报与提醒',alt:'ORULINK 实际运行的校园信息页，展示今日安排、提醒中心和网页及机器人提醒方式'},points:[
   {label:'业务触发',text:'围绕课前、任务截止与手动定时提醒组织触发条件。'},
   {label:'设备反馈',text:'将已有学习安排转成机器人播报与表情反馈。'},
   {label:'授权条件',text:'执行受账号登录、设备控制授权与实际能力限制。'},
  ],note:'截图展示真实的今日简报与提醒入口；网页提醒可用，机器人播报需连接设备。'}),
 ],
 architecture:[{icon:'layout',label:'Web / 业务 API'},{icon:'code',label:'Python 连接层'},{icon:'layers',label:'Runtime / SDK'},{icon:'sliders',label:'桌面机器人'}],
 stack:[
  {category:'网页工作区',names:['React 19','TypeScript','Vite 6'],usage:'按模块组织课程、任务、日历、助手与设备控制界面。'},
  {category:'业务服务',names:['Express 4','Zod'],usage:'处理账号与领域业务，共享 Schema 统一前后端的数据校验。'},
  {category:'关系数据',names:['SQLite','node:sqlite'],usage:'持久化课程、任务及生活记录，使用事务与外键维护关系。'},
  {category:'本机连接层',names:['Python','FastAPI','WebSocket'],usage:'接收命令，经托管 worker 接入官方 Runtime，隔离网页与硬件依赖。'},
  {category:'设备接入',names:['WatcheRobot SDK','watcherobot 0.1.10'],usage:'依据实际能力接入动作、表情、音频、摄像头与执行回执。'},
  {category:'语音交互',names:['VAD','ASR / TTS'],usage:'通过可配置服务组织活动检测、识别与合成，协调倾听和播报阶段。'},
 ],
 developmentIntro:orulink.detailsIntro!,
 development:development(orulink,[['嵌入式应用','产品能力映射','软硬件协同'],['能力检测','本机连接层','异常恢复'],['命令生命周期','授权与会话','执行回执'],['语音状态机','半双工','采集窗口'],['领域记录复用','周期与例外','账号业务服务']]),
 review:review(orulink),previous:{name:'学绩',slug:'student-score'},next:{name:'TaskHub',slug:'taskhub'},
};

export const studentScoreCase:ProjectCase={
 slug:'student-score',name:'学绩',chineseName:'学生成绩管理',
 headline:['从一份教学表格，到','清晰可追溯的数据工作台'],
 introduction:score.description+' 围绕教师的实际整理流程，把能自动处理的格式问题和需要人工确认的异常区分开来。',
 tags:['教师需求驱动','教学数据处理','轻量 Web 平台'],online:score.online,
 media:{kind:'sample',caption:'源仓库文档中的虚构数据样例界面',galleryNote:'界面节选来自源仓库文档，使用虚构学生与成绩；点击图片可查看完整样例图。',crop:true},
 opening:{id:'directory',label:'成绩明细',alt:'学绩成绩明细样例界面，使用虚构学生，展示学院班级目录与筛选表格'},
 scenarios:[
  {icon:'people',title:'教师整理名单与成绩',text:'按教师的表格整理需求建立学院、班级与学生目录，把不同来源的成绩关联到已有名单。'},
  {icon:'sliders',title:'处理格式与数据异常',text:'定位学号格式变化、重复行、姓名冲突和缺失成绩，先核对预览，再决定如何更新。'},
  {icon:'database',title:'统计、跟进与结果交付',text:'定位需要跟进的学生，按学院班级和完整筛选范围导出，并保留更新记录。'},
 ],
 previews:[
  view(score,0,{id:'roster',label:'名单管理',icon:'people',eyebrow:'ROSTER / 身份与层级',image:scoreImage('directory','学院班级与成绩明细'),points:[
   {label:'名单解析',text:'选择 XLS / XLSX 工作表，识别表头或手动映射字段。'},
   {label:'目录归属',text:'以名单确定学院、班级和学生身份，成绩文件不覆盖归属信息。'},
   {label:'更新预览',text:'检查已有人员与姓名冲突，预览后选择更新或跳过。'},
  ]}),
  view(score,1,{id:'import',label:'成绩导入',icon:'layers',eyebrow:'IMPORT / 文件到记录',image:scoreImage('import','成绩文件导入'),points:[
   {label:'格式识别',text:'支持 CSV / TSV / XLS / XLSX，识别常见编码、分隔符与工作表结构。'},
   {label:'字段映射',text:'指定学号、姓名、状态及得分率列，明确 0–1 或 0–100 的比例。'},
   {label:'先看再写',text:'先分析文件与生成预览，确认前不修改当前成绩。'},
  ]}),
  view(score,2,{id:'cleaning',label:'清洗校验',icon:'check',eyebrow:'VALIDATION / 异常定位',image:scoreImage('cleaning','清洗结果与匹配预览'),points:[
   {label:'格式规范',text:'清理全角、空白、隐藏字符和明确的尾缀，保留学号前导零。'},
   {label:'精确匹配',text:'按清洗后的学号关联学生，以姓名核对，不做猜测性模糊匹配。'},
   {label:'异常反馈',text:'区分无效分值、姓名冲突和不可恢复的数字精度问题，给出核对说明。'},
  ]}),
  view(score,3,{id:'incremental',label:'增量更新',icon:'copy',eyebrow:'INCREMENTAL / 冲突处理',image:scoreImage('cleaning','更新与异常预览'),points:[
   {label:'同号分组',text:'合并相同重复行，按规则判断安全的高分合并。'},
   {label:'冲突拦截',text:'无法判断的冲突或无效同号行阻止任意覆盖；未匹配成绩不自动新增学生。'},
   {label:'完成保护',text:'保护已完成的有效成绩，避免被未完成记录降级。'},
  ]}),
  view(score,4,{id:'followup',label:'明细跟进',icon:'search',eyebrow:'FOLLOW-UP / 找到具体问题',image:scoreImage('directory','筛选与成绩明细'),points:[
   {label:'组合检索',text:'按学院、班级、姓名、学号、状态与得分率筛选，支持排序、分页和编辑。'},
   {label:'进度跟进',text:'定位未录入、未开始、进行中与已完成低于阈值的人员。'},
   {label:'异常追查',text:'结合历史导入异常继续核对问题，不只显示一个汇总数字。'},
  ]}),
  view(score,5,{id:'statistics',label:'统计口径',icon:'sliders',eyebrow:'STATISTICS / 数值与含义',image:scoreImage('directory','范围统计与成绩明细'),points:[
   {label:'合格规则',text:'有效得分率 ≥90% 计为合格，包含恰好 90%，进度状态另行呈现。'},
   {label:'空值与零',text:'缺分保持为空，真实完成零分保留，未完成占位值另按策略处理。'},
   {label:'结算口径',text:'结算人数与平均值排除未完成暂存值；Excel 参与人数另按导出说明计算。'},
  ],note:'90% 是本项目的业务规则，不作为学校所有课程的及格或挂科标准。'}),
  view(score,6,{id:'exports',label:'范围导出',icon:'database',eyebrow:'EXPORT / 完整结果交付',image:scoreImage('directory','成绩明细与导出入口'),points:[
   {label:'导出范围',text:'按勾选学生、当前筛选、学院或班级范围生成结果。'},
   {label:'覆盖全部',text:'导出和统计覆盖完整条件范围，不被当前分页截断。'},
   {label:'保留含义',text:'生成 CSV 或分班 Excel，保留文本学号、原状态、真实零分与空值。'},
  ]}),
  view(score,7,{id:'audit',label:'批次追溯',icon:'clock',eyebrow:'AUDIT / 可核对的更新',image:scoreImage('import','成绩导入与批次记录'),points:[
   {label:'提交检查',text:'快照预览后重新核对版本，在事务中保存变更与批次审计。'},
   {label:'条件撤销',text:'检查后续版本，存在冲突时整批拒绝撤销，避免覆盖新的修正。'},
   {label:'维护工具',text:'提供数据库备份，以及经预览和数量确认后的名单剔除。'},
  ]}),
 ],
 architecture:[{icon:'layout',label:'原生 JavaScript'},{icon:'code',label:'FastAPI 服务'},{icon:'database',label:'SQLite / 批次审计'}],
 stack:[
  {category:'界面与交互',names:['JavaScript','HTML / CSS'],usage:'按页面与控制逻辑拆分模块，组织导入向导、层级目录与筛选表格。'},
  {category:'业务接口',names:['Python','FastAPI','Uvicorn'],usage:'处理文件分析、预览提交、明细查询、导出与备份接口。'},
  {category:'输入校验',names:['Pydantic','字段映射'],usage:'明确请求结构与文件字段，先检查异常，再生成可确认的预览。'},
  {category:'文件数据',names:['CSV / TSV','XLS / XLSX'],usage:'识别编码、分隔符与工作表，实施清洗、精确匹配和范围导出。'},
  {category:'数据持久化',names:['SQLite','事务'],usage:'保存学院、班级、学生当前成绩与批次审计，关联更新在同一次事务内完成。'},
  {category:'更新与回溯',names:['Revision','行版本','批次审计'],usage:'检测预览过期、重复提交与撤销冲突，让每次修改可以核对。'},
 ],
 developmentIntro:score.detailsIntro!,
 development:development(score,[['格式规范','精确匹配','异常反馈'],['同号分组','冲突判断','增量保护'],['空值与零分','合格规则','统计口径'],['快照与事务','版本检查','整批撤销'],['问题定位','完整筛选范围','范围导出']]),
 review:review(score),previous:{name:'ClothHub',slug:'clotheshub'},next:{name:'ORULINK',slug:'orulink'},
};

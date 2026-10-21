# ORULINK 与学绩：项目内容依据

整理日期：2026-10-20。两个 Luna 子智能体分别只读梳理源码，主智能体核对关键数据结构、设备说明与计算规则并撰写作品集文案。后续为替换 ORULINK 设计参考图，实际运行其 React 网页与 Express 业务服务；使用内存数据库、独立演示账号和仓库提供的课程及日记示例，不读取原项目环境凭据或已有业务数据库，不连接机器人和模型服务。未读取学生数据库、原始成绩或备份，未修改两个源项目代码及已有数据库。

## ORULINK · 拾光校园

源码位置：`D:\desktop\ORULINK`。

定位为基于 WatcheRobot 产品与官方 Runtime/SDK 的校园智能伙伴应用。软硬件协同的贡献在网页业务、Python 连接层、托管 worker、授权与命令生命周期、语音和媒体工作流；不将厂商本体、MCU 固件或 RTOS 当作自研成果。

| 内容 | 源码与文档依据 |
| --- | --- |
| 校园工作区、课程任务、日历与生活模块 | `apps/web/src/app/router.tsx`、`apps/server/src/app.ts`、`docs/FEATURES.md` |
| 网页—业务服务—connector—worker—Runtime/SDK | `apps/robot-connector/src/orulink_connector/main.py`、`apps/robot-app-managed/app.py`、`docs/robot/README.md` |
| 账号授权、连接代际与命令状态 | `apps/server/src/modules/devices/service.ts`、`docs/api/robot.md` |
| 动作、表情、摄像头、录音与媒体适配 | `apps/robot-connector/src/orulink_connector/adapters.py`、`docs/robot/README.md` |
| ASR—助手—TTS 语音流程及半双工边界 | `apps/server/src/modules/devices/voice.ts`、`apps/server/src/modules/devices/voice-gateway.ts`、`docs/robot/README.md` |
| SDK 版本与实机验证边界 | `contracts/robot/v1/sdk-baseline.json`、`docs/robot/TESTING.md` |

SDK 基线为 watcherobot 0.1.10。当前设备按本机会话管理，不是永久序列号绑定或多设备集群；摄像头跟踪位置不等于识别身份，模拟适配器不等于实机验收。

## 学绩 · 学生成绩管理

源码位置：`D:\desktop\2026易班学生手册\student-score-site`。教师提出要求这一背景来自用户说明，具体工作流程与实现能力以源码为准，不添加未经验证的访谈、使用规模或成效数据。

| 内容 | 源码依据 |
| --- | --- |
| XLS/XLSX 名单、表头字段与学院班级目录 | `server/roster.py`、`server/app.py` |
| CSV/TSV/XLS/XLSX、编码与分隔符、字段映射 | `server/score_import.py`、`server/score_api.py`、`server/excel_reader.py` |
| 学号精确匹配、重复冲突、完成成绩保护 | `server/score_import.py`、`web/score_controller.js` |
| 空值、真实零分、得分率与合格口径 | `server/grade_rules.py`、`server/score_export.py` |
| 快照预览、revision、事务、批次撤销 | `server/score_api.py`、`server/schema.sql` |
| 待跟进、筛选范围与分班导出 | `server/follow_up.py`、`server/app.py`、`server/score_export.py` |
| 边界测试意图 | `tests/test_scores.py`、`tests/test_score_incremental.py`、`tests/test_score_exports.py` |

项目按每名学生的一份当前状态和得分率记录展开，没有科目、学分、加权总评或排名实体。得分率 ≥90（含90）为该项目合格规则；未开始、进行中的暂存值不参与已结算人数和平均值，真实完成0分保留。Excel“参与”另有 >0 口径，不泛化为所有统计相同。

## 在线入口与素材

- 学绩：<https://sz-yiban.duckdns.org/>，只读访问确认返回200，页面标题为“学绩 · 学生成绩管理”。
- TaskHub：<https://xiaolai.duckdns.org/>，只读访问确认进入 `/auth-pages/login`，页面标题为“智汇轻营”。未登录或操作业务数据。
- 学绩封面为手工 SVG 数据处理示意，明确标注非运行截图，不使用学生记录制作素材。
- ORULINK 详情图现为源码实际运行截图，已替换全部 `UI/` 产品设计参考图。工作台、课程、待办、日历、日记、助手、动作与表情、语音、照片与录音、今日简报分别从实际路由或功能切换后截取；统一为 1600×960，并生成 960px 衍生图。课程与日记由仓库示例通过真实业务服务写入内存数据库；助手保持未配置模型，设备页保持未连接状态，不构造模型回答、拍摄结果或硬件执行效果。
- 学绩继续使用 `docs/score-directory.png`、`score-import.png`、`score-cleaning-preview.png`；原项目 README 与测试说明明确这些图使用虚构数据。详情保留全部原图比例供放大查看，仅在预览框展示顶部节选。
- 博客运行检查使用临时截图，查看后删除；原项目的截图与资产不作清理或改动。

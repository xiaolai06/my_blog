// Education, experience, awards and skills are based on the resume supplied by the owner.
// Contact channels were explicitly confirmed by the owner.
export const profile = {
  name: '赖沛盛', handle: 'xiaolai06',
  role: '计算机应用技术 · 在校生',
  email: 'lps_0612@qq.com', github: 'https://github.com/xiaolai06',
  phone: '19065147278', wechat: '19065147278', qq: '1951459132',
  location: '广东 · 深圳',
  jobInterests: [
    { title: '具身智能应用开发', label: '具身智能', method: '' },
    { title: 'AI 应用与 Agent 开发', label: 'AI / Agent', method: '' },
    { title: 'AI 辅助全栈开发', label: 'AI 辅助全栈', method: 'Vibe Coding' },
  ],
  primaryStack: 'Python / TypeScript / SQL',
};

export const skills = [
  {
    icon: 'database', english: 'PYTHON & DATA', title: '编程与数据处理',
    description: '以 Python 为主要开发语言，完成数据采集、清洗、格式转换与统计，编写自动化脚本处理重复任务。',
    tools: ['Python', 'SQL', 'MySQL / SQLite', 'C / Java 基础'],
  },
  {
    icon: 'landscape', english: 'COMPUTER VISION', title: '计算机视觉与模型',
    description: '具有图像数据获取、人工标注、数据集构建、模型训练与推理实践，参与从数据到部署的完整流程。',
    tools: ['PyTorch', 'YOLOv8', 'OpenCV', 'YOLO / COCO'],
  },
  {
    icon: 'layers', english: 'ROBOTICS & PERCEPTION', title: '机器人与感知数据',
    description: '参与四足机器人项目与 ROBOTAC 具身智能竞赛，了解感知、数据采集和场景测试，实践点云记录与基础处理。',
    tools: ['PCD 点云', '数据采集', '场景测试', '问题排查'],
  },
  {
    icon: 'sparkles', english: 'AI AGENT', title: 'Agent 与大模型应用',
    description: '具有 AI Agent 开发实践，了解工具调用、工具与提示路由、上下文及记忆管理，接入多模型 API 与流式交互。',
    tools: ['Function Calling', 'Tool Routing', 'Memory', 'SSE'],
  },
  {
    icon: 'code', english: 'FULL-STACK DEVELOPMENT', title: '全栈开发与部署',
    description: '使用 React、TypeScript、Express 与 FastAPI 开发前后端应用，完成接口联调、数据建模及基础部署。',
    tools: ['Next.js / React', 'Express / FastAPI', 'Prisma', 'Linux / Nginx / PM2'],
  },
  {
    icon: 'book', english: 'AI-ASSISTED DEVELOPMENT', title: 'AI 协作开发与文档',
    description: '使用 Codex、Claude Code 辅助需求拆解、原型搭建与迭代开发，将 Vibe Coding 与代码阅读、调试和测试结合，整理开发记录与交付文档。',
    tools: ['Codex / Claude Code', 'Vibe Coding', '调试 / 测试', '技术文档 / 汇报'],
  },
];

export const education = {
  school: '深圳职业技术大学',
  major: '计算机应用技术', degree: '大专 · 在读', period: '2024.09 — 2027.09',
  description: '以编程、计算机网络与智能应用为专业基础，将课程学习与数据处理、机器视觉及 Web 开发实践结合。',
  metrics: [
    { value: '3.7', suffix: '/ 4.0', label: 'GPA' },
    { value: '前 5%', suffix: '', label: '专业排名' },
    { value: '95', suffix: '分', label: '核心课程均分' },
  ],
  courses: [
    { name: 'Python', score: '97' }, { name: 'Java 程序设计', score: '95' },
    { name: 'C 语言', score: '92' }, { name: '计算机网络', score: '92' },
    { name: '机器视觉', score: '98' }, { name: '智能控制器开发', score: '99' },
    { name: '智能控制器开发与应用', score: '99' }, { name: '面向对象开发', score: '99' },
  ],
};

export const honors = [
  { year: '2025.11', title: '全国大学生数学建模竞赛', detail: '全国一等奖', category: '数学建模' },
  { year: '2025.07', title: '数维杯全国大学生春季赛', detail: '全国二等奖', category: '数学建模' },
  { year: '2026.05', title: '深圳高校黑客松', detail: 'OPC 赛道三等奖', category: '开发实践' },
  { year: '2024 — 2026', title: '校级奖学金', detail: '连续三次获二等、三等奖学金', category: '学业表现' },
  { year: '2025.05', title: '广东省 U21 桥牌团体锦标赛', detail: '冠军 · 同年全国通讯赛第三名', category: '桥牌竞技' },
  { year: '2024.12', title: '人工智能学院校园竞赛', detail: '桥牌新生杯冠军 · 新生辩论赛亚军', category: '校园活动' },
];

export const experiences = [
  {
    title: '技术部负责人', organization: '深职易班',
    period: '2025.12 — 至今', kind: '校园经历',
    summary: '负责校易班线上活动平台的技术支持与日常维护，组织技术成员配合校级活动开展。',
    points: [
      '使用 Python 采集与清洗平台数据，完成字段提取、分类汇总和异常校验，支持学院维度的统计与申报。',
      '为活动分类、题库上传与数据整理编写辅助脚本，完成格式转换和批量处理。',
      '负责 10 余人技术团队的日常管理，组织例会、经验分享与任务复盘，跟进问题和改进安排。',
    ],
  },
  {
    title: '桥牌讲师', organization: '深圳中学初中部',
    period: '2026.03 — 2026.07', kind: '社会实践',
    summary: '独立负责桥牌选修课的课程设计、教学实施与日常管理，累计教授 60 余名学生。',
    points: [
      '每周组织 2 次实战训练，结合线上平台开展课后答疑，按学习进度调整教学内容。',
      '围绕规则理解、牌理分析与进阶策略开展针对性指导，学期末课程满意度好评率达 95%。',
    ],
  },
];

export const strengths = [
  { icon: 'book', title: '主动学习，融会贯通', text: '对不同技术方向保持兴趣，接触过多种语言、框架和开发工具。学习时先理解基本原理和使用场景，再结合具体任务逐步深入，把已有经验与新知识联系起来，持续拓宽能力范围。' },
  { icon: 'code', title: '全面实践，解决问题', text: '愿意参与需求梳理、界面与功能实现、数据处理、联调测试和部署维护等环节。遇到问题先拆解、查资料、做验证，根据任务选择合适的工具，也重视实现效果与使用体验。' },
  { icon: 'check', title: '认真负责，跟进落实', text: '认真对待承诺和分工，主动安排优先级并跟进进展。遇到困难及时说明并寻求帮助，交付前检查关键细节、整理必要记录；发现遗漏或收到反馈时，继续跟进完善。' },
  { icon: 'people', title: '坦诚沟通，协作配合', text: '在易班技术团队和桥牌教学中，积累了任务协调、信息表达与倾听反馈的经验。协作时尊重不同观点，及时同步进度和疑问，愿意承担团队需要的工作，与伙伴共同把事情做好。' },
];

export const interests = [
  { icon: 'trophy', title: '桥牌', text: '在牌局中练习逻辑、判断与合作，也把对桥牌的热爱带进课堂。' },
  { icon: 'layers', title: '数学建模', text: '喜欢从数据与模型出发，和伙伴一起拆解问题、验证思路。' },
  { icon: 'music', title: '音乐', text: '用音乐切换日常节奏，在专注开发之外留一点放松的时间。' },
  { icon: 'book', title: '技术记录', text: '整理开发中的发现、踩坑与思考，让一次实践成为下一次的积累。' },
];

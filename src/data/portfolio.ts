export type Project = {
  id: string;
  name: string;
  type: string;
  time: string;
  summary: string;
  images: string[];
};

export const profile = {
  name: "沈涵今",
  role: "UX/交互设计师",
  slogan: "用设计讲故事，用设计传递情感～",
  tags: ["快乐小狗", "养狗人", "staycation"],
  experience: "3年",
  city: "上海",
  birthday: "2001.02.11",
  photo: "/assets/profile-photo.jpg",
  about:
    "我目前拥有3年电商UX设计经验。我关注用户研究、信息架构、任务流程与可用性验证，习惯从业务诉求和用户情感出发，用设计讲故事，并传递清晰有温度的体验",
  contact: {
    phone: "18012815903",
    wechat: "18012815903",
    email: "1853017949@qq.com",
  },
};

export const experiences = [
  {
    title: "拼多多公司",
    org: "UX/交互设计",
    time: "2023.07 - 2026.07",
    detail: "负责企业级数据产品的体验策略、核心流程重构、设计系统协同推进；与产品、研发、数据团队合作，完成从需求定义、方案设计到上线验证的完整流程。",
  },
];

export const education = [
  {
    title: "南京艺术学院",
    org: "交互设计 / 本科",
    time: "2019 - 2023",
    detail: "主要学习人机交互代码和页面ui软件。系统学习交互设计相关方法，建立从用户理解、产品结构到界面表达的设计基础。",
  },
];

export const capabilities = [
  {
    name: "用户研究与需求定义",
    level: "95%",
    percent: 95,
    description: "参与前期调研，理解业务诉求与用户需求，并将问题转化为清晰的设计目标。",
  },
  {
    name: "信息架构与流程设计",
    level: "92%",
    percent: 92,
    description: "梳理复杂业务流程，重构全局交互架构与视觉层级，让任务路径更清晰高效。",
  },
  {
    name: "交互原型可用性验证",
    level: "90%",
    percent: 90,
    description: "从 0-1 参与全链路交互设计，使用 AI 工具辅助调研与原型输出，推动方案快速验证。",
  },
  {
    name: "职能协作与设计落地",
    level: "94%",
    percent: 94,
    description: "与产品、研发、数据团队协作，持续整理设计规范文档，推进设计方案上线并为团队提效。",
  },
];

export const projects: Project[] = [
  {
    id: "project-01",
    name: "晒单活动（从0-1项目）",
    type: "UX设计",
    time: "2026",
    summary:
      "参与“晒单小红书”项目从0-1的搭建，包括前期调研，需求定义，担任全部交互原型图，以及部分UI设计输出，上线后跟进数据，进行多次迭代，数据均有显著提升。",
    images: ["/assets/project-push-cover.png", "/assets/project-push-cover.png", "/assets/project-push-cover.png"],
  },
  {
    id: "project-02",
    name: "多多果园（营销游戏玩法）",
    type: "交互设计",
    time: "2024",
    summary:
      "与产品一起参与需求输出，提出多个创新idea落地并带来显著增量；核心参与2次战略级大规模改版，重构全局交互架构与视觉层级，并独立梳理交互沉淀",
    images: ["/assets/project-garden-cover.png", "/assets/project-garden-cover.png", "/assets/project-garden-cover.png"],
  },
];

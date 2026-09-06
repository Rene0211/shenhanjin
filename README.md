# 个人作品网站原型

这是一个面向招聘方、设计负责人和潜在合作客户的设计师个人作品集原型，使用 React、TypeScript、Tailwind CSS、Framer Motion 和 Lucide React 构建。

## 页面结构

- `HeroSection`：个人信息首屏，包含顶部导航、巨型姓名标题、职业定位、磁性肖像占位和联系按钮。
- `MarqueeSection`：两行项目作品预览，随滚动反向横移，点击可进入项目详情模块。
- `AboutSection`：经历背景模块，包含中心大标题、四角装饰、逐字符滚动显现文字、工作经历和学习经历。
- `ServicesSection`：设计能力模块，白色圆角叠层，使用超大编号、能力说明和极简进度条。
- `ProjectsSection`：项目作品模块，使用 sticky 堆叠项目卡片和“查看项目”按钮。
- `ProjectDetail`：项目详情模块，延续深色背景、渐变大标题和大圆角项目视觉。
- `ContactModule` / `ContactSection`：联系方式模块，底部锚点加全屏圆角联系浮层，仅包含电话、微信、邮箱。

## 内容替换

所有姓名、职业信息、经历、能力、项目和联系方式都集中在 `src/data/portfolio.ts`，当前使用“待补充”占位，避免虚构真实履历。

## 运行

```bash
pnpm install
pnpm run dev
```

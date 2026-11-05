# 拾玖搜证台 · 项目根站

[公开入口](https://nineting19.github.io/) · [记录器](https://nineting19.github.io/zhengzhou-geo-demo-20261102/search-notebook/app.html) · [掘金使用说明](https://juejin.cn/post/7704197912935071778)

维护者：拾玖（nineting19）。这是浏览器本地 AI 搜索实验记录工具的说明与导航站，不是虚构公司。

手动保存豆包等 AI 的回答和来源，按名称发现、需求推荐、网址读取分别统计，支持 JSON、CSV、Markdown 导出。无需工具账号或 API Key，不自动代问，不提供云端同步或效果保证。

## 根目录文件

- robots.txt 在域名根目录明确允许抓取并指向站点地图。根域名此前返回 404；404 本身不代表禁止抓取，不能声称此改动修复了豆包未命中的原因。
- sitemap.xml 为站点地图索引，链接根页及已有项目站点地图；原有项目 URL 保留。
- llms.txt 仅供导航，不是收录或排名保证。
- 页面为直接含正文的静态 HTML，不依赖 JavaScript 显示产品说明。

## 实验边界

截至 2026-11-06，正式采样 27 条：名称路径 0/10，需求推荐 0/14；另 3 条正式网址诊断中 1 条核对通过。固定三题 N01、S01、S03：名称 0/7，需求 0/12。其余 5 题为原有 q1 的首次采样，不能当作已有基线的改善。

另有 5 条带额外线索的链路诊断或上游对象对照，单列；合计 32 条真实回答。DEV 新文章已匿名核验，发布后第一批三题均未发现目标。判定由助手逐条核对，同账号个性化未排除。

技术检查、给网址识别、通知受理、平台内发现和上游对照不能替代本工具独立发现。没有已验证真实爬虫访问日志。详见[实验状态](https://nineting19.github.io/zhengzhou-geo-demo-20261102/search-notebook/evidence.html)。

本仓库不包含真实采样原文、账号资料、Cookie、浏览器调试信息或私人工作区文件。未接入站点请求日志，不能宣称已验证真实爬虫访问。公开页面使用 AI 辅助生成与编辑，功能与结果以实现和记录为依据。

上游流程：[Fangx-AI/geo-doctor](https://github.com/Fangx-AI/geo-doctor)。记录器归属与许可见原项目 credits.html。

## 原创案例

[拾玖搜证台 GEO 实测：技术检查 100 分后，豆包仍未独立发现](https://juejin.cn/post/7704318835461849088)（2026-11-05）。已在未登录会话核对全文与来源；文章是维护者实验快照，非第三方测评。

11 月 5 日下午追加核验：未登录掘金，名称搜索选择“最新优先”，能找到两篇实际文章；综合排序当前前 20 条未包含目标。两篇文章关闭 JavaScript 仍可读。这是平台内发现证据，没有新增豆包回答或独立发现成绩。

## DEV 原创技术教程 · 2026-11-06

[A tiny evidence log for manual AI search tests (拾玖搜证台)](https://dev.to/nineting19/a-tiny-evidence-log-for-manual-ai-search-tests-shi-jiu-sou-zheng-tai--3nbc) 已公开，匿名、禁用 JavaScript 与完整 Markdown 核验通过。平台如实标记 Fully Autonomous。文章为维护者原创方法教程，发布不等于搜索命中。

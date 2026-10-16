# DSH Intelligent UI

参考 [thesysdev/open-intelligent-ui](https://github.com/thesysdev/open-intelligent-ui)，使用同一 OpenUI Lang 引擎，将模型生成的交互界面嵌入 DeepSeek Harness 现有聊天。组件与样式是原创实现，未复制未标明许可证的演示项目源码。

## 使用

安装并刷新 DSH Web 后，输入栏左侧有 **✦ 试试智能 UI** 按钮。点击会向当前会话发送演示请求，由当前模型生成预算规划器；它不是提前制作好的静态网页，也不启动第二个聊天服务。

也可以直接发送：

> 用智能交互界面做一个月度预算规划器，收入和各项支出可调整，余额与图表实时联动。

> 把下面的项目数据做成可筛选、可排序的比较表，并加入图表。

> 做一个旅行准备清单，勾选项目时更新完成数量，最后可以让助手给建议。

模型先读取 `intelligent_ui_guide`，再调用 `render_intelligent_ui`。界面出现在工具调用卡片内，不替换普通 Markdown 答复。模型决定具体布局、文案、数据和控件；效果取决于当前模型遵循 OpenUI 语法的能力。

## 已实现

- 19 个组件：布局、卡片、指标、文本、徽章、输入框、数字输入、滑块、勾选框、选择器、按钮、条形/折线图、可筛选排序的表格和列表。
- `$variable` 响应式绑定，输入变化立即更新本地派生结果，无须再调用模型。
- 流式生成预览，完成前禁用交互；只有通过校验的源程序进入渲染器。
- `@Set` / `@Reset` 本地动作；`@ToAssistant` 在用户点击后，向同一会话提交普通排队消息，不绕过已有模型、权限和工具审批。
- 中文/英文内置文案、DSH 浅色/深色主题 token、窄屏布局和键盘可访问的原生控件。
- 已完成界面的源程序保存在 DSH 工具结果元数据中，历史窗口缺少对应调用时仍可恢复。
- 控件状态保存在当前浏览器的 localStorage，按会话、调用和程序区分；不跨浏览器同步，也不是 DSH 会话事实。重置按钮恢复程序默认值。

## 安装与开发

要求 Node >=22，DSH Web 当前版本支持 `tool.call.toolview` / `conversation.input.left` 插槽。无需 Thesys Cloud 账号或额外模型 API key。

```sh
git clone https://github.com/xiaowenzhou/dsh-open-intelligent-ui.git
cd dsh-open-intelligent-ui
npm ci --ignore-scripts
npm run check
npm run verify:pack
npm pack
```

`npm pack` 会先运行构建和测试，生成 `local-dsh-intelligent-ui-0.1.0.tgz`；安装包自带 Host/Client 产物、组件指南、图标、语言资源与第三方许可，使用者不需要安装 esbuild。`verify:pack` 会在工作区以外的新临时目录中，仅安装生产依赖并校验双端导出和工具。仓库的 GitHub Actions 在每次提交时执行同样的验证，并上传 `dsh-intelligent-ui-npm` 构建产物。

**这是可分发的 npm 安装包，尚未发布到 npm 公共仓库。** 当前包名保留为 `@local/dsh-intelligent-ui`，与已安装实例一致。发布到 npm 时需要拥有 `@local` scope 权限，或将清单、Loader patch 和相关测试统一改为可用的自有包名；GitHub 仓库所有权不会自动赋予 npm scope 权限。直接从 Git URL 安装未设置 `prepare`，请使用已构建的 `.tgz` 或按照上述步骤构建源码。

在 DSH 内通过 `plugin_manager` 的 `install_bundle` 安装本目录的绝对路径，开启后按照管理器返回的刷新/重启提示操作。不要直接改写 profile 的 loader 文件。移除时在插件管理中禁用或移除 `@local/dsh-intelligent-ui`。

## 安全和范围

这不是任意代码沙箱。模型只能组合受信任组件和有限函数。禁止 HTML/JavaScript/iframe、Query/Mutation、外部网络工具、Run/OpenUrl、Each/Range 以及未注册组件/函数。用户按钮不能直接订票、付款或执行命令。

限制包括：64000 字符、150 个声明、5000 个原始及展开表达式节点、64 层递归和 128000 字符展开文本预算；禁止循环引用、动态属性索引、原型关键字及 SDK 内部对象标志。状态默认值和 `@Set` 值仅接受标量字面量，数据运算用普通派生声明。浏览器持久化状态最多 32000 字符，载入时过滤内部标志。复杂超限程序会显示可诊断错误，由模型重新生成。

首版不提供原项目的地图、远程照片、任意小游戏、外部链接导航，也不保证与 ChatGPT 官方 Intelligent UI 完全一致。演示数据均为虚构；真实数据应先由已有工具获取。

## 验证

`npm run check` 覆盖源码校验与绕过回归、3 个示例的最终 Client 视图 SSR、预算/旅行派生联动、Host 工具结果元数据和 Client 原生插槽注册契约。SSR 不是浏览器验收。真实页面还需确认按钮、流式过程、筛选排序及后续消息。

## 参考与许可

- [参考演示项目](https://github.com/thesysdev/open-intelligent-ui)
- [OpenUI Renderer 文档](https://www.openui.com/docs/openui-lang/renderer)
- [OpenUI 源码与 MIT 许可](https://github.com/thesysdev/openui)

依赖固定为 `@openuidev/lang-core` / `@openuidev/react-lang` 1.0.1、Zod 4.4.3；第三方许可随构建产物附带。React 使用 DSH 页面自己的模块实例，不在 Client bundle 中重复打包。

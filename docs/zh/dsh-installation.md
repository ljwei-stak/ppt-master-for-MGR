# 在 Model Router / DeepSeek Harness 中使用 PPT Master

`@ljwei-stak/ppt-master-for-mgr` 6.3.3 将上游 PPT Master 6.3.0 工作流打包为
DSH 原生插件。发行版本由 `package.json` 管理；技能和 Claude marketplace
元数据保留上游版本和署名。GitHub 标签、Release `v6.3.3` 与 npm 对应同一份发行包。

6.3.3 适配 DSH Desktop 2.0.7 / SDK 0.1.5-rc.1，并可从可配置的 Python 管理根目录
自动选择项目虚拟环境；同时包含 6.3.2 的 Windows Python 3.13+ PPTX 导出权限修复。

## 功能

- 根据主题、文档或资料生成可编辑的 PowerPoint 演示文稿。
- 复用品牌、风格、版式和整套模板工作区，填充或编辑原生 PPTX。
- 使用上游资料转换、SVG 检查和原生 DrawingML 导出工具。
- 在所选工作流及已安装工具支持时添加备注、动画和旁白。
- 在 Model Router 对话中通过 DSH 原生 `skill` 工具发现并加载 `ppt-master`。

适配器不包含大模型或图片服务。Model Router 选择对话模型；图片生成、联网和
可选音视频工具使用各自配置的服务。上游的图片重建 PPTX 流程目前仅支持 Codex，
不在本 DSH 适配器的支持范围内。

## 安装

使用 DSH 0.1.2-rc.1 或更新版本，并保留原生技能注册服务、文件系统技能提供器和
`skill` 工具。需要 Node.js 22.19+、Python 3.10+。

在 DSH 插件管理中安装或更新：

```text
@ljwei-stak/model-router-galgame@0.4.27
```

Router 0.4.27 会安装 PPT 包，并在同一配置中加入对应插件。如果单独管理 Router，
也可以独立安装：

```text
@ljwei-stak/ppt-master-for-mgr@6.3.3
```

通过 DSH 的聚合包安装流程应用包内 `cordis.patch.yml`，然后启用或重新加载配置。
仅执行 `npm install` 只会下载文件，不会自动应用 DSH 配置。手动管理配置时，可以
执行 `npm install @ljwei-stak/ppt-master-for-mgr@6.3.3`，再合并包内配置补丁。
同一配置中只保留一个 `ppt-master-for-mgr` 条目。

## 准备 Python

在 DSH 命令行工具实际使用的环境中执行：

```sh
npx --yes --package=@ljwei-stak/ppt-master-for-mgr@6.3.3 ppt-master-for-mgr doctor
npx --yes --package=@ljwei-stak/ppt-master-for-mgr@6.3.3 ppt-master-for-mgr setup
npx --yes --package=@ljwei-stak/ppt-master-for-mgr@6.3.3 ppt-master-for-mgr doctor
```

`setup` 显式运行 `python -m pip install -r`，安装包内依赖清单，需要连接 Python
包索引。建议先激活虚拟环境。可以为上述命令添加 `--python <解释器绝对路径>`，
明确指定解释器；使用非默认解释器时，在 DSH 命令行环境中将 `PPT_MASTER_PYTHON`
设为同一可执行文件。如果管理根目录中包含 `envs/ppt-master`，可使用
`--python-root <目录>` 或设置 `PPT_MASTER_PYTHON_ROOT`；CLI 会使用该环境，不会回退到
全局解释器。插件不会在 npm 安装时修改系统 Python 或执行 `setup`。

`doctor` 检查 Python 和核心 PPTX 模块，不检查密钥、可选工具、远程图片或音频
服务，也不评估模型效果。FFmpeg、Pandoc 等仅在对应工作流要求时安装。

## 在 Model Router 中调用

在当前 DSH 智能体预设中启用原生 `skill`、文件读写和命令行工具。收到 PPT 需求后，
模型应先调用 `skill(name="ppt-master")`，再执行工作流。例如：

> 用 ppt-master 根据附件报告制作 8 页可编辑的季度复盘 PPT。

常规流程会先确认方案，再生成页面；明确要求快速生成时，使用上游快速流程。
资料和生成项目写入用户的 DSH 工作目录；脚本与内置模板从已安装技能的绝对目录
读取。文件、命令行、网络和浏览器操作继续遵循宿主审批。

## 排查与版本同步

- 技能目录中没有 `ppt-master`：检查插件是否加载、原生技能服务是否存在，
  以及当前预设是否开放 `skill` 工具。
- Python 导入失败：使用 DSH 命令行的同一解释器执行 `doctor` 和 `setup`。
  在另一个 Python 环境安装依赖不会解决当前环境的问题。
- 创建项目时报权限错误：使用可写的绝对工作目录，并为初始化命令指定
  `project_manager.py init <名称> --dir <工作目录>/projects`。
- 图片或旁白服务不可用：按所选工作流配置对应服务；npm 包不包含服务密钥。

仅在要求更新时同步版本。按语义版本比较 npm 与 GitHub `package.json`，不降级、
不覆盖已发布的 npm 版本或标签；安装包内容变化时发布新版本。每次发行包含
GitHub Release 和 npm 安装包附件。不设置定时后台同步。

PPT Master 的版权归 Hugo He 所有，Copyright (c) 2025-2026，采用 MIT 许可证。
本分支添加 DSH / Model Router 适配，并保留上游许可证与署名。

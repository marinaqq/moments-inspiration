# 灵感快照库

> 2026微信小程序开发大赛参赛作品 ·「与AI共生」

截图收藏与AI创作辅助工具。用户主动截图导入，多模态AI自动识别文字与图片内容，生成标签和摘要，支持关键词搜索、AI文案生成、灵感萃取和风格仿写。所有数据本地存储，无后端服务器。

## 功能特性

- **截图导入**：从相册选择截图，支持批量导入，图片自动压缩
- **AI智能识别**：多模态大模型进行OCR文字提取、图片内容理解，自动生成标签和摘要
- **灵感库浏览**：卡片式展示，支持关键词搜索和标签筛选
- **AI发圈文案**：根据收藏内容生成3条不同风格（文艺/幽默/简约）文案，一键复制
- **灵感萃取**：分析内容的核心观点、写作风格和可复用表达模式
- **风格仿写**：选择自己的新图片，AI参考收藏风格生成同风格配文
- **纯文字模式**：支持直接粘贴文字内容收藏
- **数据管理**：JSON格式导出/导入备份，一键清空

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端 | 微信小程序原生（WXML / WXSS / JavaScript） |
| AI模型 | Qwen3-VL-8B-Instruct（多模态大模型） |
| AI服务 | 魔搭社区 ModelScope API（OpenAI兼容格式） |
| 数据存储 | wx.storage + FileSystemManager（全本地） |
| 图片处理 | wx.chooseMedia + wx.compressImage |
| 后端 | 无（隐私优先架构） |

## 快速开始

### 环境要求

- 微信开发者工具
- 微信小程序 AppID

### 安装

1. Clone 本仓库
2. 用微信开发者工具打开项目目录
3. 在 `project.config.json` 中填入你的 AppID

### 配置 API Key

1. 前往 [魔搭社区](https://www.modelscope.cn) 注册账号
2. 在 [我的访问令牌](https://modelscope.cn/my/myaccesstoken) 获取 API Key
3. 在小程序「我的 → 自定义API配置」中填入 Key
4. （可选）在小程序后台配置 request 合法域名：`https://api-inference.modelscope.cn`

## 项目结构

```
moments-inspiration/
├── app.js                    # 全局逻辑，AI配置
├── app.json                  # 页面路由、tabBar、窗口配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── utils/
│   ├── storage.js            # 本地存储CRUD、搜索、标签管理
│   ├── image.js              # 图片压缩、持久化、base64转换
│   └── ai.js                 # AI接口封装（识别/文案/萃取/仿写）
└── pages/
    ├── index/                # 灵感库首页（搜索、标签筛选、卡片列表）
    ├── add/                  # 收藏页（选图、AI识别、结果编辑）
    ├── detail/               # 详情页（文案生成、灵感萃取、风格仿写）
    └── settings/             # 我的（API配置、统计、数据管理）
```

## AI使用说明

| 功能 | 模型 | 用途 |
|------|------|------|
| 截图识别 | Qwen3-VL-8B-Instruct | OCR文字提取、图片理解、自动标签和摘要 |
| 文案生成 | Qwen3-VL-8B-Instruct | 生成3条不同风格文案 |
| 灵感萃取 | Qwen3-VL-8B-Instruct | 分析观点、写作风格、可复用模式 |
| 风格仿写 | Qwen3-VL-8B-Instruct | 参考收藏风格为新图片配文 |

所有AI调用通过 `wx.request` 发起，API Key 存储在用户本地，不上传至任何自有服务器。

## 隐私设计

- 不自动读取任何微信数据，所有内容由用户主动选择导入
- 文字和图片全部存储在手机本地
- 仅在AI识别时将图片发送至第三方AI接口（ModelScope），使用HTTPS
- 支持数据导出、导入和一键删除

## 第三方资源

- AI模型：Qwen3-VL-8B-Instruct（阿里通义千问，通过魔搭社区API调用）
- 无其他第三方SDK、字体或图片资源
- 所有UI为原创设计

## License

MIT

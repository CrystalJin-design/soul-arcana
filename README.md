# 你的灵魂底牌是哪张塔罗

午夜蓝与旧金色的塔罗自我探索网站。24道原创情境题、22种大阿尔卡那结果、22幅原创牌面，支持手机与电脑。

正式网站：https://crystaljin-design.github.io/soul-arcana/ 。后端与数据库运行于Supabase新加坡项目`dibcvjahfkktxlwxvtwp`。店铺名称为“屿岸”。

## 已实现

- 测评密码验证；一个密码最多开启3次；服务端数据库核算次数。
- 点击“开始测评”才扣次。同一密码的未完成测评可以继续，多设备同时开始也只保留一次未完成测评。
- 选中答案即可翻题，后台按顺序自动保存；支持上一题、修改答案、刷新恢复，另一页面修改时提示并载入最新进度。
- 确定性的题目评分，22种结果均可获得；包含画像、光影面、关系、答题回声、8维倾向、行动建议与另一张牌的视角。
- 生成整份报告PNG长图、系统图片分享、复制公开结果链接；报告底部展示店铺和客服微信。
- 再测一次、历史结果、好评有礼1元返现提示、店铺与微信配置。

## 本机预览

需要Node.js 22.13以上，推荐24。

```powershell
npm ci
npm run dev
```

打开 http://localhost:5173 。本地服务使用8788端口；本地Postgres数据位于忽略提交的`data/local-postgres`。

当前交付预览密码：`SOUL-PREVIEW-2026`，保留3次机会。此密码只用于本地预览，线上密码需在Supabase部署后单独生成。

首次在另一台电脑运行时先生成本地密码：

```powershell
npm run codes:create -- --count 10
```

开发时请先关闭本地服务再运行本地密码命令，避免两个PGlite进程同时打开同一数据目录。线上密码管理没有这个限制。

## 部署

生产环境为GitHub Pages静态网站 + Supabase Edge Function/Postgres，不依赖这台电脑持续开机。完整步骤见[部署指南](docs/deployment.md)。

修改店铺名、客服微信和返现文案：编辑`site.config.json`；同时重新部署前端和Edge Function。

## 密码发货

线上管理密钥只放在本机`.env.admin.local`，不要提交到GitHub，也不要设置成任何`VITE_`变量。

```text
SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_SERVICE_ROLE_KEY=仅供本机管理使用的密钥
```

```powershell
npm run codes:create -- --production --count 100
npm run codes:list -- --production
npm run codes:revoke -- --production --code 要停用的密码
```

每个密码固定3次。生成的发货CSV位于`data/online-codes-时间.csv`，含明文密码，请自行保管。数据库只存不可反解的密码哈希，不能找回原密码。停用密码会阻止后续答题，既有公开结果仍可阅读。

## 验证

```powershell
npm test
npm run build
npm audit --omit=dev
```

自动测试覆盖22种结果可达性、非法答案、三次限额、重复开始、进度持久化、跨密码隔离、并发修改冲突、提交幂等、公开报告与数据库访问权限。浏览器验证记录见[验收记录](docs/verification.md)。

部署维护人员还可运行`node scripts/check-production.js`验证真实线上API。它创建独立QA密码，不使用发货CSV中的密码；运行前需有本机管理环境文件与`data/supabase-public-key.txt`。

## 保存与分享

电脑点击保存会下载PNG。手机提供单张完整长图预览，向下滑动可查看全部分析及联系方式，可长按图片保存，浏览器支持时也可调用系统分享菜单；网页无法在用户未操作的情况下直接写入手机相册。微信内置浏览器的保存行为以手机系统为准。

结果链接含随机192位标识。知道链接的人可阅读这份报告，转发前请确认愿意分享。链接不包含测评密码或整份原始答案。

本工具为塔罗象征与原创情境题结合的娱乐、自我观察内容，不做命运预测或心理诊断。

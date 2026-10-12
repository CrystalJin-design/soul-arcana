# GitHub Pages + Supabase 部署指南

## 1. Supabase

在Supabase账号中建立专用项目，优先选择靠近用户的亚洲区域。先使用账号已有免费额度；如需付费套餐，请由店主决定。免费项目长期无活动可能暂停，严格持续在线需根据Supabase当前套餐选择支持该要求的方案。

CLI登录由账号本人完成：

```powershell
npx supabase login --no-browser --agent no --output pretty
npx supabase projects list
npx supabase link --project-ref 项目标识
npx supabase db push
```

`db push`应用`supabase/migrations`中的迁移。也可把同一迁移文件完整粘贴到项目SQL Editor执行。该迁移只创建`arcana_`前缀的表和函数；不修改其他业务。

生成并发布函数。`--use-api`使用官方服务端打包，无需安装Docker：

```powershell
npm run edge:prepare
npx supabase functions deploy tarot --project-ref 项目标识 --no-verify-jwt --use-api
npx supabase secrets set ALLOWED_ORIGINS=https://你的账号.github.io --project-ref 项目标识
```

`ALLOWED_ORIGINS`填写浏览器来源，即协议与域名，不含仓库路径。多个来源以英文逗号分隔；使用自定义域名时一并添加。只给开发者自己的项目配置正式域名。

函数地址为`https://项目标识.supabase.co/functions/v1/tarot`。函数自行验证测评密码会话；公开配置、题目和结果无需Supabase用户登录。`--no-verify-jwt`只关闭网关的用户JWT检查，测评限额与所有写入仍受函数和数据库控制。

内置`SUPABASE_URL`与`SUPABASE_SERVICE_ROLE_KEY`由Supabase运行时提供，不需要在前端配置。RLS已启用，匿名角色和普通登录角色不能读表或调用内部RPC。

## 2. GitHub Pages

把源代码提交到专用仓库，分支名`main`。可使用公开仓库以支持免费Pages；提交前检查`git status`，确保没有本机环境文件、密码CSV或数据库。仓库中不包含测评密码与管理密钥。

在仓库Settings → Pages中，将Source设为**GitHub Actions**。在Settings → Secrets and variables → Actions → Variables添加：

| Repository variable | 内容 |
| --- | --- |
| `VITE_API_URL` | Supabase函数完整地址 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | 项目publishable key，或兼容anon key；可公开，不能使用service-role key |

仓库已提供`.github/workflows/pages.yml`，推送`main`后自动安装依赖、运行测试、构建并部署。它会根据Pages信息配置资源路径和分享链接，不需要修改路由。

等待Actions成功后打开部署输出的网址。上线验证必须在该网址真实登录、答题、打开分享链接和导出图片；本地成功不能代替线上验收。

## 3. 线上发货密码

在本机创建`.env.admin.local`，填入本项目URL与service-role key。执行：

```powershell
npm run codes:create -- --production --count 100
```

从生成CSV发货，每码3次。请保留原始CSV备份。不要把管理密钥、数据库密码或明文发货码写进GitHub Actions Variables、网页源码或公开文档。

## 4. 更新与维护

- 修改题目、评分、报告文案：运行测试，再执行`edge:prepare`并发布函数。既有结果为完成时的快照，不会随新版本改变。
- 修改视觉：推送GitHub后等待Pages部署。
- 修改店铺名、微信：更新`site.config.json`并重新部署前后端。
- Supabase数据库备份以所用套餐提供的能力为准；另保存发货CSV，二者用途不同。
- 不要重置线上数据库来更新网站。新增结构通过新的迁移文件发布。
- 本地数据库是开发用数据，与线上互不相通。

GitHub Pages与Supabase属于境外托管服务，不同地区和运营商的访问质量需要用实际用户网络验证；如长期面向中国大陆销售，可另评估国内托管与域名方案。

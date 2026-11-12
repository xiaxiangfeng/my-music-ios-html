# App 推广网站

VinylPocket 的网页位于 `docs/`，A Little Lighter 的网页位于 `docs/a-little-lighter/`。两个 Cloudflare Worker 连接同一个 GitHub 仓库，各自在子域名根目录提供英文首页。

## Cloudflare 部署

在管理 `annibao.top` 的 Cloudflare 账户中，分别将两个 Worker 连接到 `xiaxiangfeng/my-music-ios-html` 的 `main` 分支。构建命令留空，部署命令为 `npx wrangler deploy`。

| Worker 名称 | Root directory | 子域名 | 中文首页 |
| --- | --- | --- | --- |
| `vinylpocket` | 仓库根目录 | `vinylpocket.annibao.top` | `/zh-cn/` |
| `a-little-lighter` | `workers/a-little-lighter` | `a-little-lighter.annibao.top` | `/zh-Hans/` |

Wrangler 配置中的 `routes` 负责绑定子域名。若实际使用其他子域名，同步更新相应配置、页面里的绝对网址和 `sitemap.xml`。

## 上线与收录

1. 确认两个子域名的中英文首页、帮助、隐私页面和站点地图均可通过 HTTPS 访问。
2. 确保 App Store 已填写的旧支持或隐私链接仍可访问。迁移旧站时，在原托管服务将旧链接重定向到各自的新页面。
3. 在 Google Search Console 提交两个站点地图，再用「网址检查」对四个首页请求编入索引。[VinylPocket 站点地图](https://vinylpocket.annibao.top/sitemap.xml) · [A Little Lighter 站点地图](https://a-little-lighter.annibao.top/sitemap.xml)

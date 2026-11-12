# VinylPocket 推广网站

`docs/` 是静态站点目录，包含英文首页、`zh-cn/` 简体中文首页，以及帮助和隐私页面。两版首页共用样式和素材。

## 发布与 Google 收录

站点地址沿用 App Store 隐私政策链接所在的目录。若改用其他域名或目录，发布前同步更新 HTML 里的 `canonical`、`hreflang`、Open Graph 网址和 `sitemap.xml`。

1. 将 `docs/` 下的内容发布到网站目录。[站点地址](https://home.annibao.top/my-music-ios-html/)
2. 确认两版首页、样式、图片和 `sitemap.xml` 可从公网通过 HTTPS 匿名访问，并返回 HTTP 200。如果主机根目录有 `robots.txt`，确认其中的规则允许抓取这些页面和资源。
3. 在 Google Search Console 验证站点的 URL 前缀并提交 `sitemap.xml`，再用「网址检查」对两版首页请求编入索引。[Search Console](https://search.google.com/search-console) · [Sitemap](https://home.annibao.top/my-music-ios-html/sitemap.xml)

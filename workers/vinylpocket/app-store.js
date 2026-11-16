// App Store territories, using the two-letter codes in App Store web URLs.
// https://developer.apple.com/help/app-store-connect/reference/app-information/app-store-localizations
const storefronts = new Set(`
  ae af ag ai al am ao ar at au az ba bb be bf bg
  bh bj bm bn bo br bs bt bw by bz ca cd cg ch ci
  cl cm cn co cr cv cy cz de dk dm do dz ec ee eg
  es fi fj fm fr ga gb gd ge gh gm gr gt gw gy hk
  hn hr hu id ie il in iq is it jm jo jp ke kg kh
  kn kr kw ky kz la lb lc lk lr lt lu lv ly ma md
  me mg mk ml mm mn mo mr ms mt mu mv mw mx my mz
  na ne ng ni nl no np nr nz om pa pe pg ph pk pl
  pt pw py qa ro rs ru rw sa sb sc se sg si sk sl
  sn sr st sv sz tc td th tj tm tn to tr tt tw tz
  ua ug us uy uz vc ve vg vn vu xk ye za zm zw
`.trim().split(/\s+/));

const productPath = "/app/vinylpocket-music-player/id6820082772";

function regionPicker(detectedCountry, chinese) {
  const copy = chinese
    ? {
        language: "zh-Hans",
        title: "选择 App Store 地区",
        description: "请选择你的 Apple 账户所在的国家或地区。",
        label: "国家或地区",
        placeholder: "请选择",
        mainlandChina: "中国大陆",
        open: "在 App Store 查看 VinylPocket",
        back: "返回 VinylPocket 首页",
        home: "/zh-cn/",
      }
    : {
        language: "en",
        title: "Choose your App Store region",
        description: "Select the country or region of your Apple Account.",
        label: "Country or region",
        placeholder: "Choose a country or region",
        mainlandChina: "China mainland",
        open: "View VinylPocket on the App Store",
        back: "Back to VinylPocket",
        home: "/",
      };

  const regionNames = new Intl.DisplayNames(copy.language, { type: "region" });
  const options = Array.from(storefronts, (code) => ({
    code,
    name: code === "cn" ? copy.mainlandChina : regionNames.of(code.toUpperCase()),
  }))
    .sort((a, b) => a.name.localeCompare(b.name, copy.language))
    .map(({ code, name }) => {
      const label = name.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
      return `<option value="${code}"${code === detectedCountry ? " selected" : ""}>${label}</option>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="${copy.language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${copy.title} · VinylPocket</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <main>
    <h1>${copy.title}</h1>
    <p>${copy.description}</p>
    <form class="region-form" method="get" action="/app-store">
      ${chinese ? '<input type="hidden" name="lang" value="zh-Hans">' : ""}
      <label for="country">${copy.label}</label>
      <select id="country" name="country" required>
        <option value="" disabled${storefronts.has(detectedCountry) ? "" : " selected"}>${copy.placeholder}</option>
        ${options}
      </select>
      <button type="submit">${copy.open}</button>
    </form>
    <p><a href="${copy.home}">${copy.back}</a></p>
  </main>
</body>
</html>`;
}

export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/app-store" && url.pathname !== "/app-store/") {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    const chinese = url.searchParams.get("lang") === "zh-Hans";
    const detectedCountry = request.cf?.country?.toLowerCase();
    const country = url.searchParams.get("country")?.toLowerCase() ?? detectedCountry;
    if (url.searchParams.has("choose") || !storefronts.has(country)) {
      const html = request.method === "HEAD" ? null : regionPicker(detectedCountry, chinese);
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex",
        },
      });
    }

    const product = new URL(`https://apps.apple.com/${country}${productPath}`);
    if (country === "cn" && !chinese) {
      product.searchParams.set("l", "en-GB");
    }

    return new Response(null, {
      status: 302,
      headers: { Location: product.href, "Cache-Control": "no-store" },
    });
  },
};

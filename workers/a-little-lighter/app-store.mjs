const productPath = "/app/a-little-lighter/id6829619108";
const route = "/app-store/";

// Regions listed with App Store availability at https://support.apple.com/en-us/118205.
const storefronts = new Set(`
  AE AF AG AI AL AM AO AR AT AU AZ BA BB BE BF BG BH BJ BM BN
  BO BR BS BT BW BY BZ CA CD CG CH CI CL CM CN CO CR CV CY CZ
  DE DK DM DO DZ EC EE EG ES FI FJ FM FR GA GB GD GE GH GM GR
  GT GW GY HK HN HR HU ID IE IL IN IQ IS IT JM JO JP KE KG KH
  KN KR KW KY KZ LA LB LC LK LR LT LU LV LY MA MD ME MG MK ML
  MM MN MO MR MS MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR
  NZ OM PA PE PG PH PK PL PT PW PY QA RO RS RU RW SA SB SC SE
  SG SI SK SL SN SR ST SV SZ TC TD TH TJ TM TN TO TR TT TW TZ
  UA UG US UY UZ VC VE VG VN VU XK YE ZA ZM ZW
`.trim().split(/\s+/));

const copy = {
  en: {
    title: "Choose your App Store region",
    intro: "Select the country or region used by your Apple Account.",
    label: "Country or region",
    placeholder: "Select a country or region",
    submit: "Open on the App Store",
    china: "China mainland",
    home: "/",
  },
  "zh-Hans": {
    title: "选择 App Store 地区",
    intro: "请选择你的 Apple 账户使用的国家或地区。",
    label: "国家或地区",
    placeholder: "请选择国家或地区",
    submit: "前往 App Store",
    china: "中国大陆",
    home: "/zh-Hans/",
  },
};

function regionPicker(language, method) {
  const text = copy[language];
  const names = new Intl.DisplayNames(language, { type: "region" });
  const regions = [...storefronts]
    .map(code => ({ code, label: code === "CN" ? text.china : names.of(code) }))
    .sort((a, b) => a.label.localeCompare(b.label, language));
  const options = regions.map(({code, label}) =>
    `<option value="${code}">${label.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</option>`
  ).join("\n");

  const html = `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${text.title} | A Little Lighter</title>
  <link rel="icon" type="image/png" href="/promo/icon.png">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/guides/guides.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="${text.home}"><img src="/promo/icon.png" width="42" height="42" alt="">A Little Lighter</a>
  </header>
  <main>
    <h1>${text.title}</h1>
    <p class="intro">${text.intro}</p>
    <form class="store-region-form" method="get" action="${route}">
      <input type="hidden" name="lang" value="${language}">
      <label for="region">${text.label}</label>
      <select id="region" name="region" required>
        <option value="" disabled selected>${text.placeholder}</option>
        ${options}
      </select>
      <button class="guide-button" type="submit">${text.submit} <span aria-hidden="true">↗</span></button>
    </form>
  </main>
</body>
</html>`;

  return new Response(method === "HEAD" ? null : html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'self'; script-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self' https://apps.apple.com",
    },
  });
}

function browserRegion(acceptLanguage) {
  const languageTag = acceptLanguage?.split(/[,;]/, 1)[0].trim();
  return languageTag?.match(/^[a-z]{2,3}(?:-[a-z]{4})?-([a-z]{2})(?:-|$)/i)?.[1].toUpperCase();
}

export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== route && url.pathname !== "/app-store") {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    const language = url.searchParams.get("lang") === "zh-Hans" ? "zh-Hans" : "en";
    const selectedRegion = url.searchParams.get("region");
    const region = (selectedRegion ?? request.cf?.country)?.toUpperCase();
    const preferredRegion = browserRegion(request.headers.get("Accept-Language"));
    const regionConflict = selectedRegion === null && storefronts.has(preferredRegion) && preferredRegion !== region;
    if (url.searchParams.get("choose") === "1" || !storefronts.has(region) || regionConflict) {
      return regionPicker(language, request.method);
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: `https://apps.apple.com/${region.toLowerCase()}${productPath}`,
        "Cache-Control": "private, no-store",
      },
    });
  },
};

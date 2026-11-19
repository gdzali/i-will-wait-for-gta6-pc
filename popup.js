const $ = (id) => document.getElementById(id);
const t = (key, subs) => chrome.i18n.getMessage(key, subs) || key;

document.documentElement.lang = chrome.i18n.getUILanguage();
document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
let current = null;
let host = null;

function flash(msg) {
  $("status").textContent = msg;
  setTimeout(() => { $("status").textContent = ""; }, 1800);
}

function render() {
  $("enabled").checked = current.enabled;
  $("mode").value = current.mode;
  $("blockWholePage").checked = current.blockWholePage;
  $("aggressive").checked = current.aggressive;
  $("checkUpdates").checked = current.checkUpdates;
  $("keywords").value = current.keywords.join("\n");
  const paused = host && current.pausedSites.includes(host);
  $("pause").textContent = paused ? t("resumeSite") : t("pauseSite");
  $("pause").disabled = !host;
}

function save(patch, msg) {
  const before = { ...current };
  Object.assign(current, patch);
  chrome.storage.sync.set(current, () => {
    if (chrome.runtime.lastError) {
      // Usually Chrome's sync limit (about 8 KB per setting) for a very long keyword list.
      current = before;
      render();
      flash(t("saveFailed"));
      return;
    }
    render();
    flash(msg || t("saved"));
  });
}

chrome.storage.sync.get(GTA6_DEFAULTS, (s) => {
  current = Object.assign({}, GTA6_DEFAULTS, s);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    try {
      const u = new URL(tab.url);
      if (u.protocol.startsWith("http")) host = u.hostname.replace(/^www\./, "");
    } catch {}
    render();
    checkForUpdate();
    if (tab) {
      chrome.runtime.sendMessage({ type: "gta6-get-total", tabId: tab.id }, (res) => {
        void chrome.runtime.lastError;
        if (res) $("count").textContent = res.count;
      });
    }
  });
});

// ---------- update check ----------
// Asks GitHub for the latest release at most every 12 hours. Store installs update themselves,
// so Chrome Web Store installs (which have an update_url) skip the check.
const RELEASES_API = "https://api.github.com/repos/gdzali/i-will-wait-for-gta6-pc/releases/latest";
const CHECK_EVERY_MS = 12 * 60 * 60 * 1000;

function parseVersion(v) {
  const m = /^v?(\d+(?:\.\d+){0,3})$/.exec(String(v || "").trim());
  return m ? m[1].split(".").map(Number) : null;
}

function isNewer(latest, installed) {
  for (let i = 0; i < Math.max(latest.length, installed.length); i++) {
    const a = latest[i] || 0, b = installed[i] || 0;
    if (a !== b) return a > b;
  }
  return false;
}

async function checkForUpdate() {
  $("update").hidden = true;
  if (!current.checkUpdates || chrome.runtime.getManifest().update_url) return;
  const installed = parseVersion(chrome.runtime.getManifest().version);
  let { updateCache: cache } = await chrome.storage.local.get("updateCache");
  if (!cache || Date.now() - cache.at > CHECK_EVERY_MS) {
    try {
      const res = await fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" }, credentials: "omit" });
      if (res.ok) {
        const { tag_name } = await res.json();
        cache = { at: Date.now(), tag: String(tag_name || "") };
        await chrome.storage.local.set({ updateCache: cache });
      }
    } catch {} // offline or rate-limited: try again next time
  }
  const latest = cache && parseVersion(cache.tag);
  if (latest && installed && isNewer(latest, installed)) {
    $("updateText").textContent = t("updateAvailable", [latest.join(".")]);
    $("update").hidden = false;
  }
}

$("checkUpdates").addEventListener("change", (e) => {
  save({ checkUpdates: e.target.checked });
  if (e.target.checked) checkForUpdate(); else $("update").hidden = true;
});

$("enabled").addEventListener("change", (e) => save({ enabled: e.target.checked }, e.target.checked ? t("statusOn") : t("statusOff")));
$("mode").addEventListener("change", (e) => save({ mode: e.target.value }, t("modeSaved")));
$("blockWholePage").addEventListener("change", (e) => save({ blockWholePage: e.target.checked }));
$("aggressive").addEventListener("change", (e) => save({ aggressive: e.target.checked }, e.target.checked ? t("aggressiveOn") : t("aggressiveOff")));

$("save").addEventListener("click", () => {
  const keywords = $("keywords").value.split("\n").map((k) => k.trim()).filter(Boolean);
  save({ keywords: Array.from(new Set(keywords)) }, t("keywordsSaved", [String(keywords.length)]));
});

function readKeywords(text) {
  return text.split(/\r?\n/).map((k) => k.trim()).filter(Boolean);
}

$("export").addEventListener("click", () => {
  const keywords = readKeywords($("keywords").value);
  const url = URL.createObjectURL(new Blob([keywords.join("\n") + "\n"], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "gta6-blocker-keywords.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  flash(t("keywordsExported", [String(keywords.length)]));
});

// Firefox closes the popup as soon as a file picker opens, so import from a tab there instead.
const IS_FIREFOX = navigator.userAgent.includes("Firefox");
const IN_TAB = new URLSearchParams(location.search).has("tab");

$("import").addEventListener("click", () => {
  if (IS_FIREFOX && !IN_TAB) {
    chrome.tabs.create({ url: chrome.runtime.getURL("popup.html?tab=1") });
    window.close();
    return;
  }
  $("importFile").click();
});

$("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = ""; // allow picking the same file again
  if (!file) return;
  try {
    if (file.size > 200 * 1024) throw new Error("file too large");
    const have = readKeywords($("keywords").value);
    const merged = Array.from(new Set(have.concat(readKeywords(await file.text()))));
    save({ keywords: merged }, t("keywordsImported", [String(merged.length - have.length)]));
  } catch {
    flash(t("importFailed"));
  }
});

$("pause").addEventListener("click", () => {
  if (!host) return;
  const list = new Set(current.pausedSites);
  const wasPaused = list.has(host);
  wasPaused ? list.delete(host) : list.add(host);
  save({ pausedSites: Array.from(list) }, wasPaused ? t("resumedOn", [host]) : t("pausedOn", [host]));
});

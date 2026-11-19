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
    if (tab) {
      chrome.runtime.sendMessage({ type: "gta6-get-total", tabId: tab.id }, (res) => {
        void chrome.runtime.lastError;
        if (res) $("count").textContent = res.count;
      });
    }
  });
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

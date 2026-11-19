/* I will wait for GTA 6 PC: content script.
 * Scans the page (and everything added later) for GTA 6 keywords and hides
 * or removes the post / card / video tile that contains them.
 */
(() => {
  "use strict";

  const BLOCK_ATTR = "data-gta6-blocked";
  const OVERLAY_ID = "gta6-blocker-overlay";
  const IS_TOP = window.top === window;

  // Containers to hide, most specific first. The first selector list that
  // matches an ancestor wins, so a whole YouTube tile or tweet goes, not just its title.
  const SITE_CONTAINERS = [
    // YouTube
    "ytd-rich-item-renderer", "ytd-video-renderer", "ytd-compact-video-renderer",
    "ytd-grid-video-renderer", "ytd-reel-item-renderer", "ytd-playlist-renderer",
    "ytd-radio-renderer", "ytd-channel-renderer", "ytd-comment-thread-renderer",
    "ytd-post-renderer", "ytd-backstage-post-thread-renderer", "ytd-notification-renderer",
    "ytd-rich-shelf-renderer ytd-rich-item-renderer", "yt-lockup-view-model",
    "ytm-shorts-lockup-view-model", "ytm-shorts-lockup-view-model-v2",
    // Reddit
    "shreddit-post", "shreddit-comment", "faceplate-tracker[noun='trending_search']",
    // X / Twitter
    "article[data-testid='tweet']", "[data-testid='trend']", "[data-testid='UserCell']",
    // Google search
    ".MjjYud", "div.g",
    // Bing / DuckDuckGo
    "li.b_algo", "article[data-testid='result']",
    // Facebook, Instagram, LinkedIn, Mastodon, many news sites
    "[role='article']", ".feed-shared-update-v2", ".status"
  ].join(",");

  // Outer cells that wrap the containers above and take up space in a grid.
  const GRID_CELLS = "ytd-rich-item-renderer";

  const GENERIC_CONTAINERS = [
    "article", "li", "[role='listitem']", "tr", "figure", "blockquote", "dd", "dt",
    ".card", ".post", ".story", ".teaser", ".tile"
  ].join(",");

  const SMALL_BLOCKS = "a, p, h1, h2, h3, h4, h5, h6, td, th, figcaption, label, button, caption";

  const NEVER_HIDE = new Set(["HTML", "BODY", "MAIN", "HEAD"]);
  const SKIP_TAGS = new Set(["HEAD", "TITLE", "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION", "TEMPLATE", "SVG", "CODE"]);
  const ATTRS = ["alt", "title", "aria-label"];

  let settings = null;
  let regex = null;
  let blockedCount = 0;
  let observer = null;
  const pending = new Set();
  let flushTimer = null;

  // ---------- settings ----------

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function buildRegex(keywords) {
    const parts = keywords
      .map((k) => k.trim())
      .filter(Boolean)
      // "GTA 6" also matches "GTA-6", "gta_6", "GTA.6", "gta   6"
      .map((k) => k.split(/\s+/).map(escapeRe).join("[\\s\\-_.]*"));
    if (!parts.length) return null;
    // Not preceded/followed by a letter or digit, so "GTA VI" does not match "GTA Vice City"
    // and "GTA 6" does not match "GTA 60".
    return new RegExp(`(?<![\\p{L}\\p{N}])(?:${parts.join("|")})(?![\\p{L}\\p{N}])`, "iu");
  }

  function siteIsPaused() {
    const host = location.hostname.replace(/^www\./, "");
    return (settings.pausedSites || []).some((s) => host === s || host.endsWith("." + s));
  }

  function active() {
    return settings && settings.enabled && (regex || settings.aggressive) && !siteIsPaused();
  }

  // ---------- matching ----------

  // Communities, hashtags and handles that start with GTA 6, even with more letters after:
  // r/GTA6, /r/GTA6Leaks, r/GTAVI, r/GTA_6, #GTA6Trailer, @GTA6News, r/GrandTheftAutoVI.
  // "vi" followed by "ce" is left alone so r/GTAViceCity is not blocked.
  const COMMUNITY_RE = /(?:(?<![\p{L}\p{N}])r\/|#|@)(?:gta|grand[_-]?theft[_-]?auto)[_-]?(?:6|six|vi(?!ce))[\p{L}\p{N}_]*/iu;

  // Aggressive mode: any Grand Theft Auto, e.g. GTA, GTA V, GTA5, GTA Online, GTA San Andreas,
  // Grand Theft Auto IV, r/GTAOnline, #GTAV, plus the series' cities.
  const AGGRESSIVE_RE = new RegExp(
    "(?<![\\p{L}\\p{N}])(?:gta(?:[\\s\\-_.]*(?:\\d+|i{1,3}|iv|vi?))?|grand[\\s\\-_.]*theft[\\s\\-_.]*auto|vice[\\s\\-_.]*city|los[\\s\\-_.]*santos|liberty[\\s\\-_.]*city)(?![\\p{L}\\p{N}])" +
    "|(?:(?<![\\p{L}\\p{N}])r\\/|#|@)(?:gta|grand[_-]?theft[_-]?auto)[\\p{L}\\p{N}_]*",
    "iu"
  );

  function matches(text) {
    if (!text) return false;
    if (regex && regex.test(text)) return true;
    if (COMMUNITY_RE.test(text)) return true;
    return !!settings.aggressive && AGGRESSIVE_RE.test(text);
  }

  function urlMatches() {
    let path = location.pathname + location.search;
    try { path = decodeURIComponent(path); } catch {}
    return matches(path);
  }

  function isInsideSkipped(el) {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (n.id === OVERLAY_ID) return true;
      if (n.hasAttribute(BLOCK_ATTR)) return true;
      if (SKIP_TAGS.has(n.tagName.toUpperCase())) return true;
      if (n.isContentEditable) return true; // never hide what the user is typing
    }
    return false;
  }

  function pickContainer(el) {
    // Grid cells go first: closest() returns the nearest match, so for a YouTube home tile it
    // would pick the inner lockup and leave an empty cell holding its place in the grid.
    let target = el.closest(GRID_CELLS) || el.closest(SITE_CONTAINERS) || el.closest(GENERIC_CONTAINERS);
    if (target && NEVER_HIDE.has(target.tagName)) target = null;
    if (!target) {
      const small = el.closest(SMALL_BLOCKS);
      if (small && !NEVER_HIDE.has(small.tagName)) target = small;
    }
    if (!target && !NEVER_HIDE.has(el.tagName) && (el.textContent || "").length <= 400) {
      target = el;
    }
    return target;
  }

  function block(el) {
    if (!el || !el.isConnected || el.hasAttribute(BLOCK_ATTR)) return;
    blockedCount++;
    if (settings.mode === "remove") {
      el.remove();
    } else {
      el.setAttribute(BLOCK_ATTR, "");
    }
  }

  function blockTextNode(node) {
    const parent = node.parentElement;
    if (!parent || isInsideSkipped(parent)) return;
    const target = pickContainer(parent);
    if (target) {
      block(target);
      return;
    }
    // Text sits loose inside a big block: hide just this piece of text.
    const span = document.createElement("span");
    span.setAttribute(BLOCK_ATTR, "");
    node.replaceWith(span);
    span.appendChild(node);
    blockedCount++;
  }

  function checkElementAttrs(el) {
    if (isInsideSkipped(el)) return;
    for (const a of ATTRS) {
      if (matches(el.getAttribute(a))) {
        const target = pickContainer(el);
        if (target) block(target);
        return;
      }
    }
    if (el.tagName === "A" && matches(decodeURIComponentSafe(el.getAttribute("href") || ""))) {
      const target = pickContainer(el);
      if (target) block(target);
    }
  }

  function decodeURIComponentSafe(s) {
    try { return decodeURIComponent(s); } catch { return s; }
  }

  function scan(root) {
    if (!root || !root.isConnected) return;

    if (root.nodeType === Node.TEXT_NODE) {
      if (matches(root.nodeValue)) blockTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE && isInsideSkipped(root)) return;

    // Text
    const hits = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        return matches(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    for (let n = walker.nextNode(); n; n = walker.nextNode()) hits.push(n);
    hits.forEach(blockTextNode);

    // Attributes (thumbnail alt text, tooltips, aria labels, link URLs)
    const sel = "[alt],[title],[aria-label],a[href]";
    if (root.nodeType === Node.ELEMENT_NODE && root.matches(sel)) checkElementAttrs(root);
    root.querySelectorAll(sel).forEach(checkElementAttrs);
  }

  // ---------- whole-page block ----------

  function dismissKey() {
    return "gta6-blocker-dismissed:" + location.href;
  }

  function pageIsDismissed() {
    try { return sessionStorage.getItem(dismissKey()) === "1"; } catch { return false; }
  }

  function checkPage() {
    if (!IS_TOP) return;
    const overlay = document.getElementById(OVERLAY_ID);
    const shouldBlock = active() && settings.blockWholePage && (matches(document.title) || urlMatches()) && !pageIsDismissed();

    if (!shouldBlock) {
      if (overlay) overlay.remove();
      return;
    }
    // Stop trailers from playing behind the overlay.
    document.querySelectorAll("video, audio").forEach((m) => { try { m.pause(); } catch {} });
    if (overlay) return;

    const o = document.createElement("div");
    o.id = OVERLAY_ID;
    const t = (k) => chrome.i18n.getMessage(k);
    const h1 = document.createElement("h1");
    h1.textContent = t("overlayTitle");
    const p = document.createElement("p");
    p.textContent = t("overlayText");
    const row = document.createElement("div");
    const back = document.createElement("button");
    back.className = "gta6-primary";
    back.dataset.act = "back";
    back.textContent = t("overlayBack");
    const show = document.createElement("button");
    show.dataset.act = "show";
    show.textContent = t("overlayShow");
    row.append(back, show);
    o.append(h1, p, row);
    o.addEventListener("click", (e) => {
      const act = e.target && e.target.getAttribute("data-act");
      if (act === "back") {
        if (history.length > 1) history.back();
        else location.href = "about:blank";
      } else if (act === "show") {
        try { sessionStorage.setItem(dismissKey(), "1"); } catch {}
        o.remove();
      }
    });
    document.documentElement.appendChild(o);
  }

  // ---------- badge ----------

  let reportTimer = null;
  function reportCount() {
    clearTimeout(reportTimer);
    reportTimer = setTimeout(() => {
      try { chrome.runtime.sendMessage({ type: "gta6-count", count: blockedCount }); } catch {}
    }, 300);
  }

  // ---------- observing ----------

  function flush() {
    flushTimer = null;
    if (!active()) { pending.clear(); checkPage(); return; }
    const before = blockedCount;
    const nodes = Array.from(pending);
    pending.clear();
    for (const n of nodes) scan(n);
    checkPage();
    if (blockedCount !== before) reportCount();
  }

  function schedule() {
    if (!flushTimer) flushTimer = setTimeout(flush, 30);
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => pending.add(n));
          if (m.target && m.target.nodeName === "TITLE") pending.add(m.target);
        } else if (m.type === "characterData") {
          pending.add(m.target);
        } else if (m.type === "attributes") {
          pending.add(m.target);
        }
      }
      if (pending.size) schedule();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS.concat("href")
    });
  }

  function unblockAll() {
    document.querySelectorAll(`[${BLOCK_ATTR}]`).forEach((el) => el.removeAttribute(BLOCK_ATTR));
    const o = document.getElementById(OVERLAY_ID);
    if (o) o.remove();
    blockedCount = 0;
  }

  function fullScan() {
    if (active()) scan(document.documentElement);
    checkPage();
    reportCount();
  }

  function applySettings(s) {
    settings = Object.assign({}, GTA6_DEFAULTS, s);
    regex = buildRegex(settings.keywords || []);
  }

  chrome.storage.sync.get(GTA6_DEFAULTS, (s) => {
    applySettings(s);
    startObserver();
    fullScan();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fullScan, { once: true });
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    chrome.storage.sync.get(GTA6_DEFAULTS, (s) => {
      applySettings(s);
      unblockAll();
      fullScan();
    });
  });

})();

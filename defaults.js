// Shared default settings (loaded by the content script and the popup).
// eslint-disable-next-line no-unused-vars
const GTA6_DEFAULTS = {
  enabled: true,
  // "hide" sets display:none (safe on every site, reversible).
  // "remove" deletes the element from the page (can confuse some web apps).
  mode: "hide",
  // Cover the whole page when its title is about GTA 6 (e.g. a GTA 6 video or article).
  blockWholePage: true,
  // Block every Grand Theft Auto game, not only GTA 6.
  aggressive: false,
  // Popup checks GitHub Releases (at most twice a day) and shows a banner when a newer version exists.
  checkUpdates: true,
  pausedSites: [],
  keywords: [
    "GTA 6",
    "GTA VI",
    "GTA6",
    "GTAVI",
    "Grand Theft Auto 6",
    "Grand Theft Auto VI",
    "Grand Theft Auto Six",
    "GTA Six",
    "Leonida",
    "Lucia Caminos",
    "Jason Duval"
  ]
};

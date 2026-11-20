# I will wait for GTA 6 PC: GTA 6 spoiler blocker for Chrome and Firefox

![I will wait for GTA 6 on PC - Chrome extension that hides GTA 6 spoilers](assets/banner.jpg)

<p align="center">
  <a href="README.md"><img src="assets/lang/en-active.svg" alt="English" height="36"></a>
  <a href="README.tr.md"><img src="assets/lang/tr.svg" alt="Türkçe" height="36"></a>
  <a href="README.az.md"><img src="assets/lang/az.svg" alt="Azərbaycanca" height="36"></a>
  <a href="README.es.md"><img src="assets/lang/es.svg" alt="Español" height="36"></a>
</p>
<p align="center">
  <a href="https://chromewebstore.google.com/detail/i-will-wait-for-gta-6-pc/caadeeddpphlmpldjbhbbigojjenkdmd"><img src="https://img.shields.io/chrome-web-store/v/caadeeddpphlmpldjbhbbigojjenkdmd?label=Chrome%20Web%20Store&logo=googlechrome&logoColor=white&color=4285F4" alt="Chrome Web Store" height="28"></a>
</p>

**GTA 6 spoiler blocker** for Chrome, Edge, Brave and Opera. Waiting for **GTA 6 on PC** and don't want the console
release spoiled? This free, open source extension hides **GTA 6 / GTA VI / Grand Theft Auto 6** spoilers, trailers,
leaks, story details, news, YouTube videos, Reddit posts (r/GTA6) and tweets until you are ready to play.

Hides or deletes anything about GTA 6 from every web page, including content that loads later
(infinite scroll on YouTube, Reddit, X, Google, news sites).

## Install
**Chrome, Edge, Brave and Opera:** install it from the [Chrome Web Store](https://chromewebstore.google.com/detail/i-will-wait-for-gta-6-pc/caadeeddpphlmpldjbhbbigojjenkdmd). It updates automatically.

### Load unpacked (developer version)
1. Download the latest zip from the Releases page and unzip it (or clone this repo).
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and pick the `gta6-blocker` folder (the one containing `manifest.json`).
5. Pin the extension from the puzzle-piece menu so you can see the badge count.

Works in Edge, Brave and Opera the same way.

### Firefox
Install it from Firefox Add-ons once it's approved. Until then, to try it temporarily:
1. Download `i-will-wait-for-gta6-pc-firefox-<version>.zip` from the Releases page.
2. Open `about:debugging#/runtime/this-firefox` and click **Load Temporary Add-on...**
3. Pick the zip file. (Temporary add-ons are removed when Firefox restarts.)

Requires Firefox 128 or newer.

### Building
`node scripts/build.mjs` creates the Chrome and Firefox zips in `dist/`.

## What it does
- Matches keywords anywhere in page text, image alt text, tooltips, aria labels and link URLs.
- Hides the whole post / video tile / tweet / search result / list item that contains a match.
- If the page title itself matches (e.g. you open a GTA 6 video), the page is covered and videos are paused.
  You can click "Show this page anyway".
- Also catches subreddits like `r/GTA6`, `r/GTA6Leaks`, `r/GTAVI`, hashtags like `#GTA6Trailer` and handles like `@GTA6News`.
  Opening such a subreddit, or any page whose URL mentions GTA 6, covers the whole page. (`r/GTAViceCity` is not blocked.)
- Badge on the icon shows how many items were hidden on the current tab.

## Popup settings
- **Blocking on/off**
- **Hide it** (default, reversible) or **Delete it from the page** (removes elements; reload to bring them back).
  Hide is safer on sites like YouTube and X, which can glitch when their elements are deleted.
- **Cover whole page if its title matches**
- **Keywords**: one per line. Spaces also match `-`, `_`, `.`, so `GTA 6` catches `gta-6`. Not case sensitive.
  Matches whole words only, so `GTA VI` doesn't catch `GTA Vice City`.
- **Aggressive mode**: blocks every Grand Theft Auto game, not just GTA 6 (GTA V, GTA5, GTA Online, San Andreas, Vice City, Los Santos, r/GTAOnline...).
  Note that it also hides plain "GTA", which is used for other things too (e.g. Greater Toronto Area).
- **Pause on this site**

Default keywords: GTA 6, GTA VI, GTA6, GTAVI, Grand Theft Auto 6 / VI / Six, GTA Six, Leonida, Lucia Caminos, Jason Duval.

The interface is in Turkish, Azerbaijani or Spanish when your browser is set to that language, and English otherwise.

## Privacy
The extension collects no data. The only network request is an optional update check: the popup asks GitHub at most every 12 hours whether a newer version exists (turn it off with "Notify me about new versions"). Your settings stay in your browser's storage. Details: [PRIVACY.md](PRIVACY.md)

## Limits
- Text drawn inside images or video frames (thumbnails with "VI" in the art) can't be read; only the surrounding text is checked.
- Content inside closed shadow DOM is not scanned.

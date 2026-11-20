# GTA 6 PC'yi Bekleyeceğim: Chrome ve Firefox için GTA 6 spoiler engelleyici

![GTA 6 PC'yi Bekleyeceğim - GTA 6 spoilerlarını gizleyen Chrome eklentisi](assets/banner.jpg)

<p align="center">
  <a href="README.md"><img src="assets/lang/en.svg" alt="English" height="36"></a>
  <a href="README.tr.md"><img src="assets/lang/tr-active.svg" alt="Türkçe" height="36"></a>
  <a href="README.az.md"><img src="assets/lang/az.svg" alt="Azərbaycanca" height="36"></a>
  <a href="README.es.md"><img src="assets/lang/es.svg" alt="Español" height="36"></a>
</p>
<p align="center">
  <a href="https://chromewebstore.google.com/detail/i-will-wait-for-gta-6-pc/caadeeddpphlmpldjbhbbigojjenkdmd"><img src="https://img.shields.io/chrome-web-store/v/caadeeddpphlmpldjbhbbigojjenkdmd?label=Chrome%20Web%20Store&logo=googlechrome&logoColor=white&color=4285F4" alt="Chrome Web Mağazası" height="28"></a>
</p>

Chrome, Edge, Brave ve Opera için **GTA 6 spoiler engelleyici**. **GTA 6'yı PC'de** oynamak için bekliyorsan ve konsol
sürümünden spoiler yemek istemiyorsan bu ücretsiz, açık kaynak eklenti **GTA 6 / GTA VI / Grand Theft Auto 6**
spoilerlarını, fragmanlarını, sızıntılarını, hikaye detaylarını, haberleri, YouTube videolarını, Reddit gönderilerini
(r/GTA6) ve tweet'leri sen hazır olana kadar gizler.

GTA 6 PC'ye gelene kadar fragmanlar, sızıntılar ve hype ile uğraşmak istemeyenler için.
Bu eklenti, gezdiğin her sayfadan GTA 6 ile ilgili her şeyi gizler veya siler. Sonradan yüklenen
içerikleri de yakalar (YouTube, Reddit, X, Google, haber siteleri ve sonsuz kaydırma).

## Kurulum
**Chrome, Edge, Brave ve Opera:** [Chrome Web Mağazası](https://chromewebstore.google.com/detail/i-will-wait-for-gta-6-pc/caadeeddpphlmpldjbhbbigojjenkdmd)'ndan kur. Otomatik olarak güncellenir.

### Paketlenmemiş olarak yükleme (geliştirici sürümü)
1. **Releases** sayfasından son sürümün zip dosyasını indir ve klasöre çıkar (veya bu depoyu klonla).
2. Chrome'da `chrome://extensions` adresini aç.
3. Sağ üstten **Geliştirici modu**nu aç.
4. **Paketlenmemiş öğe yükle**ye tıkla ve içinde `manifest.json` olan klasörü seç.
5. Simgeyi görmek için yapboz menüsünden eklentiyi sabitle.

Edge, Brave ve Opera'da da aynı şekilde çalışır.

### Firefox
Onaylandıktan sonra Firefox Eklentileri sayfasından kurabilirsin. O zamana kadar geçici olarak denemek için:
1. Releases sayfasından `i-will-wait-for-gta6-pc-firefox-<sürüm>.zip` dosyasını indir.
2. `about:debugging#/runtime/this-firefox` adresini aç ve **Geçici Eklenti Yükle...** butonuna tıkla.
3. Zip dosyasını seç. (Geçici eklentiler Firefox yeniden başlayınca kaldırılır.)

Firefox 128 veya daha yenisi gerekir.

## Ne yapar?
- Sayfa metninde, resim açıklamalarında (alt), ipuçlarında, erişilebilirlik etiketlerinde ve bağlantı adreslerinde anahtar kelimeleri arar.
- Eşleşme içeren gönderiyi, video kutusunu, tweet'i, arama sonucunu veya liste öğesini tamamen gizler.
- Sayfanın başlığı GTA 6 ile ilgiliyse (örneğin bir fragman videosu) tüm sayfayı kapatır ve videoyu durdurur.
  İstersen "Yine de bu sayfayı göster" diyebilirsin.
- `r/GTA6`, `r/GTA6Leaks`, `r/GTAVI` gibi subreddit'leri, `#GTA6Trailer` gibi hashtag'leri ve `@GTA6News` gibi hesapları da yakalar.
  Bu tür bir subreddit'e veya adresinde GTA 6 geçen bir sayfaya girersen tüm sayfa kapatılır. (`r/GTAViceCity` engellenmez.)
- Simgedeki sayı, o sekmede kaç öğenin gizlendiğini gösterir.

## Ayarlar
- **Engelleme açık/kapalı**
- **Gizle** (varsayılan, geri alınabilir) veya **Sayfadan sil** (öğeleri kaldırır, geri getirmek için sayfayı yenile).
  YouTube ve X gibi sitelerde "Gizle" daha sorunsuz çalışır.
- **Başlığı eşleşirse tüm sayfayı kapat**
- **Anahtar kelimeler**: her satıra bir tane. Boşluklar `-`, `_` ve `.` ile de eşleşir; yani `GTA 6`, `gta-6` yazısını da yakalar.
  Büyük/küçük harf fark etmez. Sadece tam kelimeler eşleşir, yani `GTA VI`, `GTA Vice City`'yi yakalamaz.
- **Agresif mod**: Sadece GTA 6'yı değil, tüm Grand Theft Auto oyunlarını engeller (GTA V, GTA5, GTA Online, San Andreas, Vice City, Los Santos, r/GTAOnline...).
  Not: Düz "GTA" kelimesini de gizler.
- **Bu sitede duraklat**

Varsayılan anahtar kelimeler: GTA 6, GTA VI, GTA6, GTAVI, Grand Theft Auto 6 / VI / Six, GTA Six, Leonida, Lucia Caminos, Jason Duval.

Arayüz, tarayıcı dili Türkçe, Azerbaycanca veya İspanyolca ise o dilde, değilse İngilizce görünür.

## Sınırlamalar
- Resim veya video karelerinin içine çizilmiş yazılar okunamaz; sadece çevresindeki metin kontrol edilir.
- Kapalı shadow DOM içindeki içerik taranmaz.

## Gizlilik
Eklenti hiçbir veri toplamaz. Tek ağ isteği isteğe bağlı güncelleme kontrolüdür: popup en fazla 12 saatte bir GitHub'a yeni sürüm olup olmadığını sorar ("Yeni sürümleri bildir" ile kapatabilirsin). Ayarların tarayıcının kendi depolamasında tutulur. Ayrıntılar: [PRIVACY.md](PRIVACY.md)

## Lisans
MIT

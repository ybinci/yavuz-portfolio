# SSR 5xx teşhisi ve deployment kontrolü

## Doğrulanan bulgular

İncelenen production yanıtlarında hem `/proje-gunlugu` hem
`/proje-gunlugu/ruzgar-turbini-tarla-analizleri-arastirma-ozeti`, Vercel'in
`FUNCTION_INVOCATION_FAILED` gövdesiyle HTTP 500 dönüyordu. Bu, eski handler'ın
oluşturduğu HTTP 503 yanıtından farklıdır.

Aynı anda `/sitemap-live.xml` HTTP 200 ve `X-Sitemap-Source: complete` döndürdü;
sorunlu yazı sitemap'te bulunuyordu. Yazı public anon erişimiyle de kontrol edildi:
status `published`, content metin ve 4407 karakterdi. Aynı gerçek veri yerelde
mevcut renderer ile HTTP 200, index/follow ve doğru canonical üretti. Dolayısıyla
bu gözlemde kaydın eksik/draft olması veya içerik formatı sorun değildi.

Production istisnasının tam mesajı yalnız Vercel Function Logs'dan öğrenilebilir;
özel deployment loglarına bu çalışma sırasında erişilmedi. Dış HTTP yanıtı,
hangi modül veya dosyanın hataya neden olduğunu tek başına söylemez.

## Düzeltilen başlangıç/paketleme sorunları

- SSR entry artık function başlangıcında statik olarak import edilmez. İstek
  hata sınırının içinde yüklenir; eksik paket/dosya için izlenebilir bir hata döner.
- Template dosyası eskiden modül yüklenir yüklenmez `process.cwd()` üzerinden
  okunuyordu. Eksik dosya erken rejected promise üreterek handler'ın catch bloğu
  devreye girmeden function'ı düşürebilirdi. Artık modüle göre sabit URL ile,
  istek içinde ve hemen await edilerek okunur. Başarısız promise cache'i temizlenir.
- SSR build'de `ssr.noExternal: true` kullanılır. React, React Router ve bunların
  cookie/set-cookie-parser gibi koşullu bağımlılıkları sunucu JS dosyasına alınır.
  Node built-in modülleri harici kalır. Runtime dosya takibinin bir transitive
  paketi atlaması SSR bundle'ını bozmaz.
- `vercel.json` içindeki `api/render.js.includeFiles = "dist-ssr/**"` korunur.
  Build `dist-ssr/entry-server.js` ve `dist-ssr/template.html` dosyalarını üretir.
  Test, bu dosyaları ve handler'ın plain-JS kaynaklarını node_modules bulunmayan
  bir deployment kopyasına taşır; başka cwd'den published detayını render eder.
- Yanlış/eksik SSR template placeholder'ları boş veya yanlış HTTP 200 yerine
  gerçek render hatası oluşturur.

## HTTP ve indeksleme davranışı

- Başarıyla render edilen published detay: HTTP 200, `text/html`, kendi canonical
  adresi, `index, follow`; noindex response header'ı yoktur.
- İlgisiz projects tablosu hatası, yüklenen bir günlük detayını 503'e çevirmez.
- İlgili veri kaynağı başarıyla okundu ama slug yok/draft: HTTP 404 ve noindex.
- Supabase erişilemiyor, fakat bilinen statik sayfa/proje var: gerçek statik
  içerikle HTTP 200 fallback uygulanır.
- Supabase erişilemiyor ve dinamik URL'nin içeriği doğrulanamıyor: HTTP 503 ve
  `Retry-After: 60`. Boş sayfa 200 gibi sunulmaz, bilinmeyen URL 404 diye silinmez.
  Bu geçici hata için kalıcı `noindex` işareti verilmez. Eski yayınları cache'den
  kullanarak draft/yayından kaldırma kararlarını atlayan bir fallback yoktur.
- Modül/template yükleme veya beklenmeyen render/kod hatası: HTTP 500, güvenli
  genel mesaj; bunun Supabase kesintisi olduğu varsayılmaz.
- Admin noindex ve Supabase Auth davranışı korunur. Sitemap ayrı function'dır;
  SSR veya upstream hata politikası sitemap'in XML davranışını değiştirmez.

## Vercel Function Logs

`/api/render` için şu JSON olaylarını ve `X-SSR-Request-Id` ile aynı `requestId`yi
arayın:

- `ssr_public_content_unavailable`: Supabase tablo adı, reason, HTTP status,
  available bayrakları; URL ve anahtar loglanmaz.
- `ssr_error`, `stage: renderer_load`: `ERR_MODULE_NOT_FOUND` ve varsa
  `missingModule` hangi runtime paketi/dosyası eksik olduğunu gösterir.
- `ssr_error`, `stage: template_load`: `ENOENT` ve `resource: template.html`.
- `ssr_error`, `stage: content_load`: bilinen upstream hatası olmayan veri/kod hatası.
- `ssr_error`, `stage: render`: React render veya template biçim hatası.
- `ssr_response`: tamamlanan isteğin 200/404/503 durumu ve kaynak availability'si.

Ham exception mesajları, Supabase URL/anahtarları veya yazı içeriği loglanmaz.
Hata türü/kodu ve stack konumları teşhis için tutulur.

## Kontrol ve yeniden yayınlama

```sh
npm ci
npm run build
npm run test
npm run lint
```

Yeni commit'i doğru Vercel projesinin production ortamına deploy edin. Build
Command `npm run build`, Output Directory `dist` olmalıdır. Deployment function
paketinde `dist-ssr` çıktıları bulunmalıdır. Cache'li eski artifact şüphesi varsa
Redeploy ekranında mevcut build cache'ini kullanmadan yeniden build edin.

```sh
curl.exe -i https://ybinci.com/proje-gunlugu/ruzgar-turbini-tarla-analizleri-arastirma-ozeti
```

HTTP 200, `text/html`, `X-SSR-Request-Id`, gerçek yazı metni ve tek doğru canonical
beklenir. Noindex bulunmamalıdır. Yeni deployment'ta hâlâ 500 varsa request ID ile
yukarıdaki stage log'unu kontrol edin; 503 varsa Supabase reason/status'ını inceleyin.
Ardından Search Console canlı URL testini yeniden çalıştırın.

Düzeltme sonrasındaki production HTTP kontrolünde sorunlu URL, HTTP 200 ve
`text/html; charset=utf-8` döndürdü. Yazının başlığı SSR HTML'de, canonical kendi
slug adresinde bulundu; noindex meta/header bulunmadı ve `X-SSR-Request-Id`
yanıtı function'ın çalıştığını doğruladı. Bu HTTP kontrolü, Search Console
panelindeki yeni canlı testin yerine geçmez; panelden test yeniden başlatılmalıdır.

# ybinci.com SEO ve yayınlama

## Render mimarisi

Mevcut React Router uygulaması korunur. Vite build artık tarayıcı paketiyle birlikte
`dist-ssr/entry-server.js` sunucu paketini üretir. Vercel Node Functions,
`/projeler`, `/projeler/:slug`, `/proje-gunlugu` ve `/proje-gunlugu/:slug` dahil
frontend route'larını tam HTML olarak render eder. Bu HTML'de içerik, başlık,
açıklama, canonical, Open Graph, JSON-LD ve gerçek PDF bağlantıları bulunur.
Tarayıcı aynı veriyle hydrate olur; geri/ileri navigasyonu React Router yürütür.
Botlara özel farklı içerik sunulmaz.

Ana sayfa ayrıca build sırasında prerender edilir. Vercel statik ana sayfayı
sunduğunda da SEO etiketleri ve içerik hazırdır. Dinamik içerik yeni istekte
Supabase'den okunur; yeni bir günlük yazısı için yeniden deploy gerekmez.
`vite preview` yalnızca statik çıktıyı sunar; SSR/API kontrolü için build sonrasında
`vercel dev` veya Vercel Preview deployment kullanın.

Sadece client-side meta etiketi eklemek ilk HTML'deki boş içeriği çözmez.
Google da SSR, statik render veya hydration önerir:
https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

## Ortam ve Vercel

Vercel Production ve gerekiyorsa Preview ortamında şu iki değişken bulunmalı:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Serverless function da aynı isimleri runtime'da okur. Secret/service-role key
kullanılmaz. `.env` Git'e dahil edilmez. Ortam değişkeni değişince frontend paketi
için yeniden deploy gerekir. Build komutu `npm run build`, çıktı dizini `dist`.
Node.js 22 veya üstü kullanılmalıdır.

`vercel.json` içindeki eski `/index.html` SPA rewrite'ı SSR function'a yönlendiren
rewrite ile değiştirilmiştir. Direkt URL ve yenileme desteği devam eder.
Mevcut PDF, görsel, robots.txt ve `/assets/` dosyaları statik olarak sunulur.
SSR template'i ve sunucu paketi function'a `includeFiles` ile dahil edilir.

Supabase RLS'de anon rolüne yalnızca `status = 'published'` satırlarını okuma
izni verilmiş olmalıdır. Frontend filtresi RLS'nin yerini tutmaz. Kodun public
okumaları admin oturumunu kullanmaz; iki tabloda da published filtresi uygular.
Admin Auth, kayıt ve düzenleme işlemleri mevcut Supabase client ile devam eder.

## Başlık, açıklama ve paylaşım

Her detay sayfasının title'ı kendi başlığından; description'ı kendi özetinden,
özet yoksa açıklama/içerikten türetilir. Mevcut veriler taşınmaz veya silinmez.
İleride `seo_title` / `seo_description` sütunları kullanılırsa bunlar otomatik
olarak öncelik kazanır; bu sütunlar zorunlu değildir.

Canonical adresler `https://ybinci.com` alanında, query/hash olmadan üretilir.
Günlük ID bağlantıları canonical olarak asıl slug adresini gösterir.
Open Graph görseli ilk içerik görseli, yoksa mevcut profil fotoğrafıdır.
JSON-LD'de günlükler Article, projeler CreativeWork olarak tanımlanır.
İçerikte olmayan tarih, sonuç veya deneyim uydurulmaz.

Rüzgâr türbini, CFD, OpenFAST, URANS ve rotor aerodinamiği terimleri ilgili
günlük başlıkları, özetleri, açıklamaları ve gerçek araştırma içeriklerinde
doğal biçimde kullanılmalıdır. Teknik altyapı sıralama veya indekslenme garantisi
vermez; bu konularda özgün yayınlanmış içerik gerekir.

## Sitemap, robots ve taslaklar

- `https://ybinci.com/sitemap.xml`, `api/sitemap.js` tarafından XML olarak üretilir.
  Altı ana sayfa, korunmuş statik projeler ve Supabase'deki published projeler/
  günlükler dahil edilir. Aynı slug tekrarlanmaz; yeni kayıtlar yeniden build
  gerektirmeden eklenir. Supabase sorguları 1000 kayıt sınırı için sayfalanır.
- Son değişiklik tarihi yalnızca gerçek `updated_at`, `date` veya `created_at`
  verisi varsa eklenir; build tarihi lastmod olarak kullanılmaz.
- Supabase erişilemiyorsa projelerde statik fallback sürer. Sitemap, yayınları
  yanlışlıkla listeden düşürmek yerine geçici `503` / `Retry-After` döndürür.
  Dinamik detay erişim hatalarında da 503; gerçekten bulunmayan detayda 404 gelir.
- `/admin` HTML'inde `noindex, nofollow` ve HTTP `X-Robots-Tag` bulunur; sitemap'e
  eklenmez. `robots.txt` admin taramasını engellemez, böylece Google noindex
  işaretini okuyabilir. Noindex, erişim güvenliği yerine geçmez; Auth korunur.
- Taslaklar public sorgu, HTML, hydration verisi ve sitemap'e alınmaz. Public
  URL'lerinde içerik açılmaz. HTML cache'lenmez; yayından alınan içerik eski
  cache üzerinden sunulmaz.
- PDF linkleri gerçek `<a href="…">` elemanlarıdır, `nofollow` kullanılmaz.
  Supabase Storage bucket'ı public olmalı; kalıcı public URL kullanılmalıdır.
  PDF'nin kendisinde veya Storage yanıtında noindex varsa PDF ayrıca indekslenmez.

## Google Search Console

1. https://search.google.com/search-console adresinde **Mülk ekle → Alan adı**
   seçin ve `ybinci.com` girin.
2. Google'ın verdiği `google-site-verification=...` TXT değerini DNS sağlayıcınızda
   kök alan adına (`@` veya sağlayıcının istediği boş host) ekleyin. Mevcut DNS
   kayıtlarını silmeyin. TXT yayıldıktan sonra **Doğrula** seçin; kaydı koruyun.
3. Bu kodu Vercel'e deploy edin. `/robots.txt`, `/sitemap.xml` ve bir published
   günlük detayını kontrol edin. Sayfa kaynağında yazı metni, tek canonical ve
   doğru title/description görünmelidir. Sitemap XML ve HTTP 200 dönmelidir.
4. Search Console → **Site Haritaları** bölümünden
   `https://ybinci.com/sitemap.xml` gönderin. Yeni yazılar aynı sitemap'e eklenir.
5. **URL Denetimi → Canlı URL'yi test et** ile ana sayfa ve örnek proje/günlük
   URL'lerini kontrol edin. Gerekirse **Dizine eklenmesini iste** seçeneğini kullanın.
6. Sayfa dizine ekleme raporlarını izleyin. Admin ve taslakları indeksleme için
   göndermeyin. Vercel Domains'te tercih edilen alan adını `ybinci.com` yapın;
   `www.ybinci.com` varsa bu adrese kalıcı yönlendirin.

DNS doğrulama: https://support.google.com/webmasters/answer/9008080
Sitemap gönderimi: https://support.google.com/webmasters/answer/7451001

## Kontroller

```sh
npm run build
npm run test:seo
npm run lint
```

SEO testleri gerçek Supabase verisine yazmaz. Mock published/taslak kayıtlarla
birleştirme, sıralama, fallback, HTML/HTTP render, meta/canonical, galeri/PDF
bağlantıları, sitemap, pagination ve HTML/JSON kaçışlarını doğrular.

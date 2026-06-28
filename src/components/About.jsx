const gallery = [
  {
    image: '/cycling.jpg',
    alt: 'Bisiklet sporu geçmişi',
    caption: '2018 yılında katıldığım son bisiklet yarışlarımdan biri.',
  },
  {
    image: '/rowinggs.jpg',
    alt: 'Galatasaray Kürek Takımı Bahar Kupası',
    caption: 'Galatasaray Kürek Takımı ile Mayıs 2019’da Bahar Kupası şampiyonluğu.',
  },
  {
    image: '/rowing.jpg',
    alt: 'GTÜ Kürek Takımı Nantes Yarışı',
    caption:
      'GTÜ Kürek Takımı ile Mayıs 2024’te Fransa/Nantes’ta düzenlenen üniversiteler arası yarışta 1000 m kategorisinde ikincilik, 500 m kategorisinde birincilik.',
  },
  {
    image: '/project.jpg',
    alt: 'Ev atölyesinde kontrol projesi prototipi',
    caption:
      '2026 yılında kendi evimde kurduğum küçük atölyede çift rotorlu kontrol projesinin fiziksel prototipi üzerinde çalışırken.',
  },
  {
    image: '/work.jpg',
    alt: 'SİHA şase kaynak ve birleştirme çalışmaları',
    caption:
      'Çalıştığım firmada geliştirilen SİHA modelinin şase kaynak ve birleştirme aşamalarından bir görüntü.',
  },
  {
    image: '/work2.jpg',
    alt: 'SİHA elektronik donanım ve montaj çalışmaları',
    caption:
      'Çalıştığım firmada geliştirilen SİHA modelinin elektronik donanım ve montaj çalışmaları.',
  },
  {
    image: '/work3.jpg',
    alt: 'SİHA batarya ve elektronik donanım çalışmaları',
    caption:
      'Çalıştığım firmada geliştirilen SİHA modelinin batarya yerleşimi ve elektronik donanım entegrasyonu çalışmaları.',
  },
]

function About() {
  return (
    <section className="page-panel section" aria-labelledby="about-title">
      <header className="section-heading">
        <p className="eyebrow">Hikâyem ve deneyimlerim</p>
        <h1 id="about-title">Hakkımda</h1>
      </header>

      <div className="about-layout">
        <aside className="about-summary">
          <p className="about-lead">
            Teoriyi saha deneyimiyle buluşturan, üretmeyi ve sistemlerin nasıl çalıştığını
            anlamayı seven bir makine mühendisliği öğrencisiyim.
          </p>
          <div className="about-facts">
            <div><strong>GTÜ</strong><span>Makine Mühendisliği</span></div>
            <div><strong>4+ yıl</strong><span>Aktif takım sporu</span></div>
            <div><strong>2+ yıl</strong><span>Takım kaptanlığı</span></div>
          </div>
        </aside>

        <div className="about-story">
          <p>
            25 Eylül 2003 tarihinde Sakarya’da doğdum. Lise eğitimimi Şehit Muhammed
            Fatih Safitürk Anadolu Lisesi’nde tamamladıktan sonra, 2022 yılında Gebze
            Teknik Üniversitesi Makine Mühendisliği bölümüne yerleştim.
          </p>
          <p>
            Ortaokul yıllarımda üç yıl boyunca Sakarya Büyükşehir Belediyesi bisiklet
            takımında profesyonel sporculuk yaptım. Bu süreçte bölgesel, ulusal ve
            uluslararası yarışlarda yarışma fırsatı buldum. Lise döneminde kürek sporu
            ile tanışarak Galatasaray Kürek Takımı’nda iki yıl aktif olarak spor hayatıma
            devam ettim. Üniversite sınavı döneminde spora ara verdikten sonra, Gebze
            Teknik Üniversitesi’nde tekrar küreğe başladım.
          </p>
          <p>
            Yaklaşık dört yıldır GTÜ Kürek Takımı’nda aktif olarak yer almakta, iki yılı
            aşkın süredir takım kaptanlığı ve topluluk başkanlığı görevlerini yürütmekteyim.
            Üniversite takımı olarak ulusal ve uluslararası yarışlarda yarışma ve derece
            elde etme fırsatı bulduk. Bunun yanında eski branşım olan bisiklete yeniden
            başlayarak mezun olmadan önce Ironman triatlonlarına hazırlanmayı hedefliyorum.
          </p>
          <p>
            Ortaokul ve lise yıllarımda babamla birlikte elektrik ve atölye işlerinde
            çalışmam, bana erken yaşta güçlü bir teknik altyapı kazandırdı. Montaj, tamir,
            üretim mantığı, el becerisi ve saha pratiğiyle büyümem; mühendislik eğitimimle
            birleştiğinde mekanik sistemleri yalnızca teorik olarak değil, gerçek çalışma
            koşullarıyla birlikte değerlendirmemi sağladı.
          </p>
          <p>
            Çocukluktan gelen tamir, üretim ve sistemleri anlama merakım, üniversite
            yıllarında mühendislik projelerine yönelmemde önemli rol oynadı. Mekanik
            tasarım, analiz, prototipleme, kontrol sistemleri ve robotik alanlarına özellikle
            ilgi duyuyorum. Bu alanlarda hem akademik projeler hem de bireysel çalışmalar
            geliştirerek teorik bilgimi uygulamalı sistemlere dönüştürmeye çalışıyorum.
          </p>
        </div>
      </div>

      <div className="gallery-heading">
        <p className="eyebrow">Sahadan kareler</p>
        <h2>Spor, atölye ve proje yolculuğum</h2>
      </div>
      <div className="about-gallery">
        {gallery.map((item, index) => (
          <figure key={item.image} className={index === 2 || index === 3 ? 'featured' : ''}>
            <img src={item.image} alt={item.alt} loading="lazy" />
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </div>

      <div className="section-actions">
        <a className="button button-primary" href="/cv.pdf" target="_blank" rel="noreferrer">
          CV Görüntüle <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  )
}

export default About

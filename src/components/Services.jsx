const engineeringServices = [
  ['CAD modelleme', 'SolidWorks ve Fusion 360 ile üretime uygun 3B parça ve montaj modelleri.'],
  ['Mekanik tasarım', 'İhtiyaca uygun mekanizma, parça ve sistem tasarımı desteği.'],
  ['ANSYS yapısal analiz', 'Gerilme, deformasyon ve dayanım odaklı yapısal doğrulama.'],
  ['ANSYS Fluent CFD', 'Akış, basınç ve aerodinamik davranışların sayısal analizi.'],
  ['Teknik raporlama', 'Analiz sonuçlarının açık, düzenli ve sunuma hazır raporlanması.'],
  ['Proje danışmanlığı', 'Fikirden doğrulamaya kadar mühendislik proje desteği.'],
]

const tutoring = [
  {
    title: 'Lise',
    items: [
      'TYT–AYT Matematik',
      'Fizik',
      'Kimya',
      'Üniversite sınavı hazırlığı ve soru çözüm stratejileri',
      'Çalışma programı ve sınav koçluğu',
    ],
  },
  {
    title: 'Üniversite',
    items: [
      'Calculus I–II',
      'Diferansiyel Denklemler',
      'Lineer Cebir',
      'Numerik Analiz ve temel mühendislik dersleri',
    ],
  },
]

function Services() {
  return (
    <section className="page-panel section" aria-labelledby="services-title">
      <header className="section-heading section-heading-row">
        <div>
          <p className="eyebrow">Birlikte çalışalım</p>
          <h1 id="services-title">Hizmetler</h1>
        </div>
        <p>
          Teknik projelerde uygulama odaklı mühendislik desteği ve öğrencilere seviyelerine
          uygun özel ders sunuyorum.
        </p>
      </header>

      <div className="service-section">
        <div className="service-title">
          <span>01</span>
          <div>
            <p className="eyebrow">Freelance destek</p>
            <h2>Mühendislik Hizmetleri</h2>
          </div>
        </div>
        <p className="service-intro">
          CAD modelleme, mekanik tasarım, yapısal analiz, CFD analizi, teknik raporlama
          ve proje danışmanlığı alanlarında freelance destek sunuyorum.
        </p>
        <div className="engineering-grid">
          {engineeringServices.map(([title, description]) => (
            <article className="service-card" key={title}>
              <span className="service-icon" aria-hidden="true">+</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="service-section tutoring-section">
        <div className="service-title">
          <span>02</span>
          <div>
            <p className="eyebrow">Birebir eğitim</p>
            <h2>Özel Ders</h2>
          </div>
        </div>
        <p className="service-intro">
          Yaklaşık dört yıldır lise ve üniversite öğrencilerine matematik, fen bilimleri ve
          temel mühendislik derslerinde özel ders veriyorum. Özellikle üniversite sınavına
          hazırlık süreci, soru çözüm stratejileri, çalışma planı oluşturma ve sınav takibi
          konularında kapsamlı deneyime sahibim.
        </p>
        <div className="tutoring-grid">
          {tutoring.map((group) => (
            <article className="tutoring-card" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services

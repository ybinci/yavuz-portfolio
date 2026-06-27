import { useState } from 'react'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('home')

  return (
    <main className="page">
      <nav className="navbar">
        <button className="logo" onClick={() => setActivePage('home')}>
          Yavuz Bahadır İnci
        </button>

        <div className="nav-links">
          <button
            className={activePage === 'about' ? 'active' : ''}
            onClick={() => setActivePage('about')}
          >
            Hakkımda
          </button>

          <button
            className={activePage === 'projects' ? 'active' : ''}
            onClick={() => setActivePage('projects')}
          >
            Projeler
          </button>

          <button
            className={activePage === 'services' ? 'active' : ''}
            onClick={() => setActivePage('services')}
          >
            Hizmetler
          </button>

          <button
            className={activePage === 'contact' ? 'active' : ''}
            onClick={() => setActivePage('contact')}
          >
            İletişim
          </button>
        </div>
      </nav>

      {activePage === 'home' && (
        <section className="hero">
          <div className="hero-text">
            <p className="eyebrow">Makine Mühendisliği Öğrencisi</p>
            <h1>Yavuz Bahadır İnci</h1>
            <p className="subtitle">
              Mekanik tasarım, analiz, simülasyon ve kontrol sistemleri alanlarında kendimi geliştiriyorum.
               Derslerde öğrendiğim teorik bilgileri proje, modelleme ve prototip çalışmalarıyla uygulamaya dönüştürmeye çalışıyorum.
            </p>

            <div className="buttons">
              <button onClick={() => setActivePage('projects')}>Projelerimi Gör</button>
              <button onClick={() => setActivePage('services')} className="secondary">
                Hizmetler
              </button>
            </div>
          </div>

          <div className="hero-photo">
          <img src="/profile.png" alt="Yavuz Bahadır İnci" className="profile-photo" />
          </div>
        </section>
      )}

     {activePage === 'about' && (
  <section className="section page-section">
    <h2>Hakkımda</h2>

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
<div className="about-gallery">
  <figure>
    <img src="/cycling.jpg" alt="Bisiklet sporu geçmişi" />
    <figcaption>
      2018 yılında katıldığım son bisiklet yarışlarımdan biri.
    </figcaption>
  </figure>

  <figure>
    <img src="/rowinggs.jpg" alt="Galatasaray Kürek Takımı Bahar Kupası" />
    <figcaption>
      Galatasaray Kürek Takımı ile Mayıs 2019’da Bahar Kupası şampiyonluğu.
    </figcaption>
  </figure>

  <figure>
    <img src="/rowing.jpg" alt="GTÜ Kürek Takımı Nantes Yarışı" />
    <figcaption>
      GTÜ Kürek Takımı ile Mayıs 2024’te Fransa/Nantes’ta düzenlenen üniversiteler arası yarışta 1000 m kategorisinde ikincilik, 500 m kategorisinde birincilik.
    </figcaption>
  </figure>

  <figure>
    <img src="/project.jpg" alt="Ev atölyesinde kontrol projesi prototipi" />
    <figcaption>
      2026 yılında kendi evimde kurduğum küçük atölyede çift rotorlu kontrol projesinin fiziksel prototipi üzerinde çalışırken.
    </figcaption>
  </figure>

  <figure>
    <img src="/work.jpg" alt="SİHA şase kaynak ve birleştirme çalışmaları" />
    <figcaption>
      Çalıştığım firmada geliştirilen SİHA modelinin şase kaynak ve birleştirme aşamalarından bir görüntü.
    </figcaption>
  </figure>


  <figure>
  <img src="/work3.jpg" alt="SİHA batarya ve elektronik donanım çalışmaları" />
  <figcaption>
    Çalıştığım firmada geliştirilen SİHA modelinin batarya yerleşimi ve elektronik donanım entegrasyonu çalışmaları.
  </figcaption>
</figure>
</div>
    <div className="section-actions">
      <a href="/cv.pdf" target="_blank">CV Görüntüle</a>
    </div>
  </section>
  
)}

      {activePage === 'projects' && (
        <section className="section page-section light">
          <h2>Projeler</h2>
          <p className="section-intro">
            Mekanik tasarım, kontrol sistemleri, FEA ve CFD alanlarında yürüttüğüm
            seçili proje çalışmalarım.
          </p>

          <div className="project-grid">
            <div className="project-card">
              <h3>Çift Rotorlu Dengeleme Sistemi</h3>
              <p>
                Arduino, BLDC motorlar, ESC ve IMU sensörü kullanılarak geliştirilen
                gerçek zamanlı kontrol sistemi prototipi.
              </p>
              <span>Kontrol Sistemleri • Prototipleme</span>
            </div>

            <div className="project-card">
              <h3>FEMOR Rehabilitasyon Sistemi</h3>
              <p>
                Alt ekstremite rehabilitasyonu için mekanik tasarım, yük analizi ve
                ANSYS Workbench ile yapısal doğrulama çalışması.
              </p>
              <span>Mekanik Tasarım • FEA</span>
            </div>

            <div className="project-card">
              <h3>İHA Yapısal Analizleri</h3>
              <p>
                Drone taşıyıcı kol, braket ve bağlantı parçaları için FEA tabanlı
                dayanım analizleri.
              </p>
              <span>İHA • Yapısal Analiz</span>
            </div>

            <div className="project-card">
              <h3>CFD Akış Analizleri</h3>
              <p>
                ANSYS Fluent kullanılarak aerodinamik kuvvet hesabı ve zemin seviyesi
                rüzgar akışı analizleri.
              </p>
              <span>CFD • ANSYS Fluent</span>
            </div>
          </div>
        </section>
      )}

      {activePage === 'services' && (
        <section className="section page-section">
          <h2>Hizmetler</h2>

          <div className="services-grid">
            <div className="service-box">
              <h3>Mühendislik Hizmetleri</h3>
              <p>
                CAD modelleme, mekanik tasarım, yapısal analiz, CFD analizi, teknik
                raporlama ve proje danışmanlığı alanlarında freelance destek sunuyorum.
              </p>
              <ul>
                <li>SolidWorks / Fusion 360 CAD modelleme</li>
                <li>ANSYS Mechanical ile yapısal analiz</li>
                <li>ANSYS Fluent ile CFD analizi</li>
                <li>Teknik rapor ve sunum hazırlama</li>
              </ul>
            </div>

            <div className="service-box">
              <h3>Özel Ders</h3>
              <p>
                Lise ve üniversite öğrencilerine matematik, fen bilimleri ve temel
                mühendislik derslerinde özel ders desteği veriyorum.
              </p>
              <ul>
                <li>Lise: TYT-AYT Matematik, Fizik, Kimya</li>
                <li>Üniversite: Calculus I-II, Diferansiyel Denklemler</li>
                <li>Lineer Cebir, Numerik Analiz ve temel mühendislik dersleri</li>
                <li>Çalışma programı ve sınav koçluğu</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {activePage === 'contact' && (
        <section className="section page-section contact">
          <h2>İletişim</h2>
          <p>
            Proje, freelance çalışma, özel ders veya iş birlikleri için benimle iletişime
            geçebilirsiniz.
          </p>

          <div className="contact-info">
            <p>Mail: mail y.inci2022@gtu.edu.tr</p>
            <p>LinkedIn: www.linkedin.com/in/yavuzbahadır</p>
            <p>Telefon: +90 551 977 2727</p>
          </div>
        </section>
      )}
    </main>
  )
}

export default App
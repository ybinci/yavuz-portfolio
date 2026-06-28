export const projects = [
  {
    slug: 'cift-rotorlu-dengeleme-sistemi',
    title: 'Çift Rotorlu Dengeleme Sistemi',
    category: 'Kontrol Sistemleri · Prototipleme',
    summary:
      'Arduino, BLDC motorlar, ESC ve IMU sensörü kullanılarak geliştirilen gerçek zamanlı kontrol sistemi prototipi.',
    description:
      'Bu proje, iki bağımsız itki kaynağına sahip çift rotorlu bir sistemin denge kontrolünü incelemek amacıyla geliştirilmiştir. Görselde yer alan prototip, mekanik yapı, sensör geri beslemesi, motor sürüşü ve PID tabanlı kontrol algoritmasının ilk fiziksel testlerini gerçekleştirmek için üretilen deneysel modeldir. Bu ilk prototip üzerinden sistem davranışı, titreşim etkileri, gövde rijitliği, sensör verilerinin filtrelenmesi ve motor tepkileri gözlemlenmiştir. Elde edilen sonuçlar doğrultusunda daha rijit, ayarlanabilir ve deneysel ölçümlere daha uygun yeni modelin tasarım ve inşa süreci devam etmektedir.',
    role:
      'Sistemin mekanik tasarımı, fiziksel prototip üretimi, elektronik bileşen entegrasyonu, sensör verilerinin okunması ve PID kontrol algoritmasının uygulanması süreçlerinde aktif rol aldım. İlk prototipten elde edilen geri bildirimlere göre yeni modelin mekanik yapısını daha rijit ve test edilebilir hale getirmek için tasarım geliştirme sürecine devam ediyorum.',
    tools: ['Arduino', 'BLDC Motor', 'ESC', 'IMU Sensörü', 'Fusion 360', 'Prototipleme'],
    images: [
      '/projects/dual-rotor/dual-rotor-1.jpg',
      '/projects/dual-rotor/dual-rotor-2.jpg',
    ],
    galleryTitle: 'İlk Prototip ve Geliştirilen Yeni Model',
  },
  {
    slug: 'femor-alt-ekstremite-rehabilitasyon-sistemi',
    title: 'FEMOR Alt Ekstremite Rehabilitasyon Sistemi',
    category: 'Mekanik Tasarım · FEA',
    summary:
      'Alt ekstremite rehabilitasyonu için geliştirilen mekanik sistemin tasarım ve yapısal doğrulama çalışması.',
    description:
      'FEMOR, kontrollü alt ekstremite hareketlerini desteklemek amacıyla geliştirilen modüler ve ayarlanabilir bir rehabilitasyon sistemi projesidir. Sistem, farklı kullanıcı antropometrilerine uyum sağlayabilecek şekilde tasarlanmış; taşıyıcı yapı, bağlantı elemanları ve hareket mekanizması kullanım senaryolarına göre modellenmiştir. Proje kapsamında 70–250 kg aralığındaki kullanıcı yükleri dikkate alınarak kritik parçalarda sonlu elemanlar analizi yapılmış ve tasarımın yapısal güvenliği değerlendirilmiştir. Analiz sonuçlarına göre mekanik tasarımda rijitlik, üretilebilirlik ve kullanım güvenliği açısından iyileştirmeler gerçekleştirilmiştir.',
    role:
      'Mekanik konseptin geliştirilmesi, parçaların CAD ortamında modellenmesi, yük senaryolarının belirlenmesi ve ANSYS Workbench üzerinde yapısal doğrulama analizlerinin yürütülmesi süreçlerinde aktif rol aldım. Ayrıca teleskopik bağlantı yapısı ve ayarlanabilir mekanizma tasarımına katkı sağlayarak sistemin farklı kullanıcı ölçülerine uyumlu hale getirilmesi üzerinde çalıştım.',
    tools: ['SolidWorks', 'ANSYS Mechanical', 'Statik Yapısal Analiz', 'CAD', 'Teknik Raporlama'],
    images: [
      '/projects/femor/femor-1.jpg',
      '/projects/femor/femor-2.jpg',
      '/projects/femor/femor-3.jpg',
      '/projects/femor/femor-4.jpg',
    ],
    galleryTitle: 'Tasarım, Sunum ve Yapısal Analiz Çıktıları',
  },
  {
    slug: 'iha-yuk-tasiyici-kol-yapisal-analizi',
    title: 'İHA Yük Taşıyıcı Kol Yapısal Analizi',
    category: 'İHA · Yapısal Analiz',
    summary:
      'İHA üzerinde kullanılan yük taşıyıcı kolun farklı yük koşulları altında dayanım ve deformasyon analizi.',
    description:
      'Taşıyıcı kol geometrisi, uçuş ve yük taşıma sırasında oluşabilecek kuvvetler dikkate alınarak analiz edildi. Kritik gerilme bölgeleri, toplam deformasyon ve emniyet katsayısı değerlendirilerek tasarımın yapısal yeterliliği incelendi.',
    role:
      'Analiz modelinin hazırlanması, malzeme ve sınır şartlarının tanımlanması, mesh yakınsama kontrolleri ve sonuçların mühendislik kriterleriyle yorumlanmasından sorumluydum.',
    tools: ['ANSYS Mechanical', 'Static Structural', 'Mesh Analizi', 'SolidWorks', 'Mukavemet'],
    images: [
      '/projects/uav-arm/uav-arm-1.jpg',
      '/projects/uav-arm/uav-arm-2.jpg',
      '/projects/uav-arm/uav-arm-3.jpg',
    ],
  },
  {
    slug: 'ansys-fluent-akis-analizi',
    title: 'ANSYS Fluent Akış Analizi',
    category: 'CFD · Akışkanlar Mekaniği',
    summary:
      'Aerodinamik kuvvetlerin ve zemin seviyesindeki rüzgâr davranışının sayısal akış analizi.',
    description:
      'Bu çalışma, farklı geometri ve akış koşullarında sistem üzerindeki aerodinamik etkilerin incelenmesi amacıyla gerçekleştirilmiştir. Proje kapsamında geometri hazırlığı, akış hacminin oluşturulması, sınır şartlarının tanımlanması ve türbülans modeli seçimi yapılarak ANSYS Fluent üzerinde CFD analizleri yürütülmüştür. Analiz sonuçları; hız dağılımı, basınç değişimi, akış ayrılması ve aerodinamik kuvvet çıktıları üzerinden değerlendirilmiştir. Elde edilen sonuçlar, sistemin akış davranışını anlamak ve tasarım kararlarını sayısal verilere dayandırmak amacıyla kullanılmıştır.',
    role:
      'Geometrinin akış analizine hazırlanması, hesaplama hacminin oluşturulması, mesh yapısının kurulması, sınır şartlarının tanımlanması ve uygun türbülans modelinin seçilmesi süreçlerinde aktif rol aldım. ANSYS Fluent üzerinde analizleri gerçekleştirerek hız, basınç ve kuvvet çıktılarını değerlendirdim; sonuçları görselleştirerek teknik yorumlama ve raporlama aşamalarına katkı sağladım.',
    tools: ['ANSYS Fluent', 'CFD', 'SpaceClaim', 'Mesh', 'Türbülans Modelleri', 'Post-processing'],
    images: [
      '/projects/fluent/fluent-1.jpg',
      '/projects/fluent/fluent-2.jpg',
      '/projects/fluent/fluent-3.jpg',
      '/projects/fluent/fluent-4.jpg',
    ],
    galleryTitle: 'CFD Modelleme, Akış Alanı ve Sonuç Görselleştirmeleri',
  },
  {
    slug: 'drone-tasiyici-braket-yapisal-analizi',
    title: 'Drone Taşıyıcı Braket Yapısal Analizi',
    category: 'Drone · Sonlu Elemanlar Analizi',
    summary:
      'Drone bağlantı braketinin çalışma yükleri altında gerilme, deformasyon ve emniyet kontrolü.',
    description:
      'Bağlantı braketinin uçuş sırasında maruz kalacağı yükler temsil edilerek kritik bölgelerdeki gerilme yığılmaları araştırıldı. Analiz sonuçları doğrultusunda geometrinin hafiflik ve dayanım dengesi değerlendirildi.',
    role:
      'CAD modelinin sadeleştirilmesi, temas ve bağlantı koşullarının kurulması, yapısal analizlerin yürütülmesi ve tasarım iyileştirme önerilerinin hazırlanmasını üstlendim.',
    tools: ['ANSYS Mechanical', 'Fusion 360', 'FEA', 'Gerilme Analizi', 'Tasarım Doğrulama'],
    images: [
      '/projects/drone-bracket/bracket-1.jpg',
      '/projects/drone-bracket/bracket-2.jpg',
      '/projects/drone-bracket/bracket-3.jpg',
    ],
  },
  {
    slug: 'fusion-360-tasarim-calismalari',
    title: 'Fusion 360 ve SolidWorks Tasarım Çalışmaları',
    category: 'CAD · Ürün Tasarımı',
    summary:
      'Üretilebilirlik ve montaj ihtiyaçları gözetilerek hazırlanan parametrik parça ve mekanizma tasarımları.',
    description:
      'Bu çalışma, farklı proje ihtiyaçlarına yönelik mekanik parça modelleme, montaj kurgusu ve tasarım revizyonlarını içeren CAD odaklı tasarım çalışmalarından oluşmaktadır. Fusion 360 ve SolidWorks kullanılarak ölçülendirilebilir, güncellenebilir ve üretim yöntemlerine uyarlanabilir parametrik modeller oluşturulmuştur. Tasarım sürecinde parçaların montaj ilişkileri, üretilebilirlik, bağlantı detayları ve teknik çizime uygunluk kriterleri dikkate alınmıştır.',
    role:
      'Tasarım gereksinimlerini CAD geometrisine dönüştürme, parçaları parametrik olarak modelleme, montaj ilişkilerini oluşturma, tasarım revizyonlarını gerçekleştirme ve teknik resim hazırlama süreçlerinde aktif rol aldım. Fusion 360 ve SolidWorks ortamlarında üretilebilirlik, montaj kolaylığı ve fonksiyonel kullanım kriterlerini dikkate alarak tasarım çalışmaları yürüttüm.',
    tools: [
      'Fusion 360',
      'SolidWorks',
      'Parametrik Modelleme',
      'Montaj Tasarımı',
      'Teknik Resim',
      'Üretilebilirlik',
      'CAD',
    ],
    images: [
      '/projects/fusion360/fusion-1.jpg',
      '/projects/fusion360/fusion-2.jpg',
      '/projects/fusion360/fusion-3.jpg',
      '/projects/fusion360/fusion-4.jpg',
      '/projects/fusion360/fusion-5.jpg',
    ],
    galleryTitle: 'CAD Modelleme, Montaj ve Tasarım Çıktıları',
  },
]

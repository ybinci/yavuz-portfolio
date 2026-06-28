function Contact() {
  return (
    <section className="page-panel contact" aria-labelledby="contact-title">
      <div className="contact-copy">
        <p className="eyebrow">İletişimde kalalım</p>
        <h1 id="contact-title">Bir fikriniz mi var?</h1>
        <p>
          Proje, freelance çalışma, özel ders veya iş birlikleri için benimle iletişime
          geçebilirsiniz.
        </p>
      </div>

      <div className="contact-list">
        <a href="mailto:y.inci2022@gtu.edu.tr">
          <span>Mail</span>
          <strong>y.inci2022@gtu.edu.tr</strong>
          <b aria-hidden="true">↗</b>
        </a>
        <a href="https://www.linkedin.com/in/yavuzbahadır" target="_blank" rel="noreferrer">
          <span>LinkedIn</span>
          <strong>linkedin.com/in/yavuzbahadır</strong>
          <b aria-hidden="true">↗</b>
        </a>
        <a href="tel:+905519772727">
          <span>Telefon</span>
          <strong>+90 551 977 2727</strong>
          <b aria-hidden="true">↗</b>
        </a>
      </div>
    </section>
  )
}

export default Contact

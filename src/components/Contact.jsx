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

      <div className="contact-actions">
        <a
          className="contact-action"
          href="https://wa.me/905519777277"
          target="_blank"
          rel="noreferrer"
        >
          <span className="contact-action-mark" aria-hidden="true">01</span>
          <span className="contact-action-copy">
            <strong>WhatsApp’tan Yaz</strong>
            <small>Hızlıca iletişime geçin</small>
          </span>
          <span className="contact-action-arrow" aria-hidden="true">↗</span>
        </a>

        <a className="contact-action" href="mailto:bordey61@icloud.com">
          <span className="contact-action-mark" aria-hidden="true">02</span>
          <span className="contact-action-copy">
            <strong>Mail Gönder</strong>
            <small>bordey61@icloud.com</small>
          </span>
          <span className="contact-action-arrow" aria-hidden="true">↗</span>
        </a>

        <a
          className="contact-action"
          href="https://www.linkedin.com/in/yavuzbahadır"
          target="_blank"
          rel="noreferrer"
        >
          <span className="contact-action-mark" aria-hidden="true">03</span>
          <span className="contact-action-copy">
            <strong>LinkedIn</strong>
            <small>Profesyonel profilimi inceleyin</small>
          </span>
          <span className="contact-action-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  )
}

export default Contact

import { showNotification } from "../utils.js"

class ContactPage extends HTMLElement {
  connectedCallback() {
    this.render()
  }

  render() {
    this.innerHTML = 
    
    `
        <div class="contact-form-container">
          <h3>Envíanos un Mensaje</h3>
          <form class="contact-form" id="contactForm">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input type="text" name="name" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" name="email" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input type="tel" name="phone" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Mensaje</label>
              <textarea name="message" class="form-textarea" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Enviar Mensaje</button>
          </form>
        </div>
      </div>

      <div class="map-container">
        <h3>Nuestra Ubicación</h3>
        <iframe 
          src="https://www.google.com/maps/place/Dg.+1+%232-70,+Cartagena+de+Indias,+Provincia+de+Cartagena,+Bol%C3%ADvar/@10.3971224,-75.5642968,17z/data=!3m1!4b1!4m5!3m4!1s0x8ef62f3cbf8ca393:0x28b129fae368e365!8m2!3d10.3971224!4d-75.5617219?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D"
          width="100%" 
          height="400" 
          style="border:0; border-radius: var(--radius-lg);" 
          allowfullscreen="" 
          loading="lazy">
        </iframe>
      </div>
    `

    this.addStyles()
    this.attachEventListeners()
  }

  attachEventListeners() {
    const form = this.querySelector("#contactForm")
    form?.addEventListener("submit", (e) => this.handleSubmit(e))
  }

  handleSubmit(e) {
    e.preventDefault()
    showNotification("Mensaje enviado exitosamente. Te contactaremos pronto.", "success")
    e.target.reset()
  }

  addStyles() {
    if (!document.getElementById("contact-page-styles")) {
      const style = document.createElement("style")
      style.id = "contact-page-styles"
      style.textContent = `
        .contact-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
        }

        .contact-info,
        .contact-form-container {
          background: var(--color-surface);
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }

        .contact-info h3,
        .contact-form-container h3 {
          color: var(--color-primary);
          margin-bottom: var(--spacing-lg);
        }

        .info-item {
          margin-bottom: var(--spacing-md);
        }

        .info-item strong {
          display: block;
          color: var(--color-text);
          margin-bottom: var(--spacing-xs);
        }

        .info-item p {
          color: var(--color-text-light);
          margin: 0;
        }

        .info-item .social-links {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .info-item .social-links a {
          color: var(--color-primary);
          text-decoration: none;
        }

        .info-item .social-links a:hover {
          text-decoration: underline;
        }

        .map-container {
          background: var(--color-surface);
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }

        .map-container h3 {
          color: var(--color-primary);
          margin-bottom: var(--spacing-md);
        }

        @media (max-width: 768px) {
          .contact-container {
            grid-template-columns: 1fr;
          }
        }
      `
      document.head.appendChild(style)
    }
  }
}

customElements.define("contact-page", ContactPage)

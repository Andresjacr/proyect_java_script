class AppFooter extends HTMLElement {
  connectedCallback() {
    this.render()
  }

  render() {
    const currentYear = new Date().getFullYear()

    this.innerHTML = `
      <footer class="footer">
        <div class="footer-content">
          <div class="footer-section">
            <h3>Hotel el Rincón del Carmen</h3>
            <p>Experiencia única en el corazón de Cartagena</p>
          </div>
          <div class="footer-section">
            <h4>Contacto</h4>
            <p>Dg. 1 #2 - 70, El Laguito</p>
            <p>Cartagena, Colombia</p>
            <p>Tel: +57 (7) 675 2782</p>
            <p>contac@hotel.com</p>
          </div>
          <div class="footer-section">
            <h4>Enlaces</h4>
            <ul>
              <li><a href="index.html">Inicio</a></li>
              <li><a href="reservas.html">Reservas</a></li>
              <li><a href="contacto.html">Contacto</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Síguenos</h4>
            <div class="social-links">
              <a href="#" aria-label="Facebook">Facebook</a>
              <a href="#" aria-label="Instagram">Instagram</a>
              <a href="#" aria-label="Twitter">Twitter</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${currentYear} Hotel el Rincón del Carmen. Todos los derechos reservados.</p>
        </div>
      </footer>
    `

    this.addStyles()
  }

  addStyles() {
    if (!document.getElementById("footer-styles")) {
      const style = document.createElement("style")
      style.id = "footer-styles"
      style.textContent = `
        .footer {
          background: var(--color-text);
          color: white;
          padding: var(--spacing-xl) 0 var(--spacing-md);
          margin-top: var(--spacing-2xl);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-md);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
        }

        .footer-section h3 {
          color: var(--color-primary);
          margin-bottom: var(--spacing-sm);
        }

        .footer-section h4 {
          color: white;
          margin-bottom: var(--spacing-sm);
          font-size: 1.1rem;
        }

        .footer-section p {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: var(--spacing-xs);
          font-size: 0.9rem;
        }

        .footer-section ul {
          list-style: none;
        }

        .footer-section ul li {
          margin-bottom: var(--spacing-xs);
        }

        .footer-section a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-section a:hover {
          color: var(--color-primary);
        }

        .social-links {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .footer-bottom {
          max-width: 1200px;
          margin: var(--spacing-lg) auto 0;
          padding: var(--spacing-md) var(--spacing-md) 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .footer-bottom p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
          }
        }
      `
      document.head.appendChild(style)
    }
  }
}

customElements.define("app-footer", AppFooter)

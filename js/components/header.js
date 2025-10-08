import { auth } from "../auth.js"
import { db } from "../database.js"

class AppHeader extends HTMLElement {
  constructor() {
    super()
    this.auth = auth
    this.db = db
  }

  connectedCallback() {
    // Make auth and db available globally
    window.auth = this.auth
    window.db = this.db

    this.render()
    this.attachEventListeners()

    // Listen for auth changes
    window.addEventListener("auth-changed", () => this.render())
  }

  getBasePath() {
    const path = window.location.pathname

    // If we're in pages/admin/ subfolder
    if (path.includes("/pages/admin/") || path.includes("/admin/")) {
      return {
        index: "../../index.html",
        reservas: "../reservas.html",
        contacto: "../contacto.html",
        admin: "../admin.html",
        auth: "../auth.html",
      }
    }

    // If we're in pages/ folder
    if (path.includes("/pages/")) {
      return {
        index: "../index.html",
        reservas: "reservas.html",
        contacto: "contacto.html",
        admin: "admin.html",
        auth: "auth.html",
      }
    }

    // If we're at root (index.html)
    return {
      index: "index.html",
      reservas: "pages/reservas.html",
      contacto: "pages/contacto.html",
      admin: "pages/admin.html",
      auth: "pages/auth.html",
    }
  }

  render() {
    const user = this.auth.getCurrentUser()
    const isAuthenticated = this.auth.isAuthenticated()
    const isAdmin = this.auth.isAdmin()
    const paths = this.getBasePath()

    this.innerHTML = `
      <header class="header">
        <nav class="nav">
          <div class="nav-brand">
            <a href="${paths.index}">Hotel el Rincón del Carmen</a>
          </div>
          <button class="nav-toggle" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul class="nav-menu">
            <li><a href="${paths.index}">Inicio</a></li>
            <li><a href="${paths.reservas}">Reservas</a></li>
            <li><a href="${paths.contacto}">Contacto</a></li>
            ${isAdmin ? `<li><a href="${paths.admin}">Admin</a></li>` : ""}
            ${
              isAuthenticated
                ? `
              <li class="nav-user">
                <span>Hola, ${user.fullName}</span>
                <button class="btn-logout">Cerrar Sesión</button>
              </li>
            `
                : `
              <li><a href="${paths.auth}" class="btn btn-primary">Iniciar Sesión</a></li>
            `
            }
          </ul>
        </nav>
      </header>
    `

    this.addStyles()
  }

  attachEventListeners() {
    const logoutBtn = this.querySelector(".btn-logout")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.auth.logout()
      })
    }

    const navToggle = this.querySelector(".nav-toggle")
    const navMenu = this.querySelector(".nav-menu")

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active")
      })
    }
  }

  addStyles() {
    if (!document.getElementById("header-styles")) {
      const style = document.createElement("style")
      style.id = "header-styles"
      style.textContent = `
        .header {
          background: var(--color-surface);
          box-shadow: var(--shadow-sm);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand a {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary);
          text-decoration: none;
        }

        .nav-toggle {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .nav-toggle span {
          width: 25px;
          height: 3px;
          background: var(--color-text);
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .nav-menu {
          display: flex;
          list-style: none;
          gap: 2rem;
          align-items: center;
        }

        .nav-menu a {
          color: var(--color-text);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .nav-menu a:hover {
          color: var(--color-primary);
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-user span {
          color: var(--color-text-light);
        }

        .btn-logout {
          padding: 0.5rem 1rem;
          background: var(--color-secondary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.3s ease;
        }

        .btn-logout:hover {
          background: var(--color-secondary-dark);
        }

        @media (max-width: 768px) {
          .nav-toggle {
            display: flex;
          }

          .nav-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--color-surface);
            flex-direction: column;
            padding: 1rem;
            box-shadow: var(--shadow-md);
            transform: translateY(-100%);
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s ease;
          }

          .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            pointer-events: all;
          }

          .nav-user {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `
      document.head.appendChild(style)
    }
  }
}

customElements.define("app-header", AppHeader)

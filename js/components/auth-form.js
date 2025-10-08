import { auth } from "../auth.js"
import { showNotification } from "../utils.js"

class AuthForm extends HTMLElement {
  constructor() {
    super()
    this.isLogin = true
  }

  connectedCallback() {
    // Redirect if already authenticated
    if (auth.isAuthenticated()) {
      window.location.href = "reservas.html"
      return
    }

    this.render()
  }

  render() {
    this.innerHTML = `
      <div class="auth-card">
        <h2>${this.isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
        <form class="auth-form" id="authForm">
          ${
            !this.isLogin
              ? `
            <div class="form-group">
              <label class="form-label">Número de Documento</label>
              <input type="text" name="documentId" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Nombre Completo</label>
              <input type="text" name="fullName" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Nacionalidad</label>
              <input type="text" name="nationality" class="form-input" required>
            </div>
          `
              : ""
          }
          <div class="form-group">
            <label class="form-label">Correo Electrónico</label>
            <input type="email" name="email" class="form-input" required>
          </div>
          ${
            !this.isLogin
              ? `
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input type="tel" name="phone" class="form-input" required>
            </div>
          `
              : ""
          }
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input type="password" name="password" class="form-input" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">
            ${this.isLogin ? "Iniciar Sesión" : "Registrarse"}
          </button>
        </form>
        <p class="auth-toggle">
          ${this.isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          <a href="#" id="toggleAuth">${this.isLogin ? "Regístrate" : "Inicia Sesión"}</a>
        </p>
      </div>
    `

    this.addStyles()
    this.attachEventListeners()
  }

  attachEventListeners() {
    const form = this.querySelector("#authForm")
    const toggleLink = this.querySelector("#toggleAuth")

    form?.addEventListener("submit", (e) => this.handleSubmit(e))
    toggleLink?.addEventListener("click", (e) => {
      e.preventDefault()
      this.isLogin = !this.isLogin
      this.render()
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    try {
      if (this.isLogin) {
        auth.login(data.email, data.password)
        showNotification("Sesión iniciada correctamente", "success")
        window.location.href = "reservas.html"
      } else {
        auth.register(data)
        showNotification("Registro exitoso", "success")
        window.location.href = "reservas.html"
      }
    } catch (error) {
      showNotification(error.message, "error")
    }
  }

  addStyles() {
    if (!document.getElementById("auth-styles")) {
      const style = document.createElement("style")
      style.id = "auth-styles"
      style.textContent = `
        .auth-card {
          background: var(--color-surface);
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          max-width: 500px;
          margin: 0 auto;
        }

        .auth-card h2 {
          text-align: center;
          color: var(--color-primary);
          margin-bottom: var(--spacing-lg);
        }

        .auth-form {
          margin-bottom: var(--spacing-md);
        }

        .auth-toggle {
          text-align: center;
          color: var(--color-text-light);
        }

        .auth-toggle a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 600;
        }

        .auth-toggle a:hover {
          text-decoration: underline;
        }
      `
      document.head.appendChild(style)
    }
  }
}

customElements.define("auth-form", AuthForm)

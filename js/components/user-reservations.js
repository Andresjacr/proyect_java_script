import { auth } from "../auth.js"
import { db } from "../database.js"
import { formatCurrency, formatDate, showNotification } from "../utils.js"

class UserReservations extends HTMLElement {
  constructor() {
    super()
    this.reservations = []
  }

  connectedCallback() {
    this.loadReservations()
    this.render()

    // Listen for reservation changes
    window.addEventListener("reservation-changed", () => {
      this.loadReservations()
      this.render()
    })
  }

  loadReservations() {
    const user = auth.getCurrentUser()
    if (!user) {
      this.reservations = []
      return
    }

    this.reservations = db.getReservationsByUserId(user.id)
  }

  render() {
    if (!auth.isAuthenticated()) {
      this.innerHTML = `
        <div class="auth-required">
          <p>Debes iniciar sesión para ver tus reservas</p>
          <a href="auth.html" class="btn btn-primary">Iniciar Sesión</a>
        </div>
      `
      this.addStyles()
      return
    }

    if (this.reservations.length === 0) {
      this.innerHTML = `
        <div class="no-reservations">
          <p>No tienes reservas activas</p>
        </div>
      `
      this.addStyles()
      return
    }

    this.innerHTML = `
      <div class="reservations-list">
        ${this.reservations
          .map(
            (reservation) => `
          <div class="reservation-card ${reservation.status === "cancelled" ? "cancelled" : ""}">
            <div class="reservation-header">
              <h4>${reservation.roomName}</h4>
              <span class="status-badge status-${reservation.status}">
                ${reservation.status === "confirmed" ? "Confirmada" : "Cancelada"}
              </span>
            </div>
            <div class="reservation-details">
              <p><strong>Entrada:</strong> ${formatDate(reservation.checkIn)}</p>
              <p><strong>Salida:</strong> ${formatDate(reservation.checkOut)}</p>
              <p><strong>Personas:</strong> ${reservation.people}</p>
              <p><strong>Total:</strong> ${formatCurrency(reservation.totalPrice)}</p>
              <p><strong>Fecha de reserva:</strong> ${formatDate(reservation.createdAt)}</p>
            </div>
            ${
              reservation.status === "confirmed"
                ? `
              <button class="btn btn-danger" data-reservation-id="${reservation.id}">
                Cancelar Reserva
              </button>
            `
                : ""
            }
          </div>
        `,
          )
          .join("")}
      </div>
    `

    this.addStyles()
    this.attachEventListeners()
  }

  attachEventListeners() {
    const cancelButtons = this.querySelectorAll(".btn-danger")
    cancelButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const reservationId = e.target.dataset.reservationId
        this.cancelReservation(reservationId)
      })
    })
  }

  cancelReservation(reservationId) {
    if (confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      db.cancelReservation(reservationId)
      showNotification("Reserva cancelada exitosamente", "success")
      this.loadReservations()
      this.render()
    }
  }

  addStyles() {
    if (!document.getElementById("user-reservations-styles")) {
      const style = document.createElement("style")
      style.id = "user-reservations-styles"
      style.textContent = `
        .auth-required,
        .no-reservations {
          background: var(--color-surface);
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .auth-required p,
        .no-reservations p {
          color: var(--color-text-light);
          margin-bottom: var(--spacing-md);
        }

        .reservations-list {
          display: grid;
          gap: var(--spacing-lg);
        }

        .reservation-card {
          background: var(--color-surface);
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }

        .reservation-card.cancelled {
          opacity: 0.6;
        }

        .reservation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--color-border);
        }

        .reservation-header h4 {
          color: var(--color-primary);
          margin: 0;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-confirmed {
          background: var(--color-success);
          color: white;
        }

        .status-cancelled {
          background: var(--color-error);
          color: white;
        }

        .reservation-details p {
          margin-bottom: var(--spacing-xs);
          color: var(--color-text);
        }

        .reservation-card .btn-danger {
          margin-top: var(--spacing-md);
        }

        @media (max-width: 768px) {
          .reservation-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-sm);
          }
        }
      `
      document.head.appendChild(style)
    }
  }
}

customElements.define("user-reservations", UserReservations)

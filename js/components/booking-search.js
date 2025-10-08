import { auth } from "../auth.js"
import { db } from "../database.js"
import { formatCurrency, calculateNights, showNotification } from "../utils.js"

class BookingSearch extends HTMLElement {
  constructor() {
    super()
    this.availableRooms = []
    this.selectedRoom = null
    this.searchParams = null
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.innerHTML = `
      <div class="booking-search">
        <form class="search-form" id="searchForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Fecha de Entrada</label>
              <input type="date" name="checkIn" class="form-input" required min="${this.getTodayDate()}">
            </div>
            <div class="form-group">
              <label class="form-label">Fecha de Salida</label>
              <input type="date" name="checkOut" class="form-input" required min="${this.getTodayDate()}">
            </div>
            <div class="form-group">
              <label class="form-label">Número de Personas</label>
              <select name="people" class="form-select" required>
                <option value="1">1 persona</option>
                <option value="2">2 personas</option>
                <option value="3">3 personas</option>
                <option value="4">4 personas</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Buscar Disponibilidad</button>
        </form>

        <div class="search-results" id="searchResults"></div>
      </div>

      <div class="modal" id="bookingModal">
        <div class="modal-content">
          <span class="modal-close">&times;</span>
          <div id="modalBody"></div>
        </div>
      </div>
    `

    this.addStyles()
    this.attachEventListeners()
  }

  attachEventListeners() {
    const form = this.querySelector("#searchForm")
    form?.addEventListener("submit", (e) => this.handleSearch(e))

    const modal = this.querySelector("#bookingModal")
    const closeBtn = this.querySelector(".modal-close")

    closeBtn?.addEventListener("click", () => {
      modal.style.display = "none"
    })

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none"
      }
    })
  }

  handleSearch(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    // Validate dates
    const checkIn = new Date(data.checkIn)
    const checkOut = new Date(data.checkOut)

    if (checkOut <= checkIn) {
      showNotification("La fecha de salida debe ser posterior a la fecha de entrada", "error")
      return
    }

    this.searchParams = {
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      people: Number.parseInt(data.people),
    }

    this.availableRooms = db.getAvailableRooms(data.checkIn, data.checkOut, Number.parseInt(data.people))
    this.renderResults()
  }

  renderResults() {
    const resultsContainer = this.querySelector("#searchResults")

    if (this.availableRooms.length === 0) {
      resultsContainer.innerHTML = `
        <div class="no-results">
          <p>No hay habitaciones disponibles para las fechas seleccionadas</p>
        </div>
      `
      return
    }

    const nights = calculateNights(this.searchParams.checkIn, this.searchParams.checkOut)

    resultsContainer.innerHTML = `
      <h3>Habitaciones Disponibles (${this.availableRooms.length})</h3>
      <div class="rooms-grid">
        ${this.availableRooms
          .map((room) => {
            const totalPrice = room.pricePerNight * nights
            return `
            <div class="room-result-card">
              <img src="${room.image}" alt="${room.name}">
              <div class="room-result-info">
                <h4>${room.name}</h4>
                <p>${room.description}</p>
                <div class="room-result-details">
                  <span>${room.beds} ${room.beds === 1 ? "Cama" : "Camas"}</span>
                  <span>Hasta ${room.maxPeople} personas</span>
                </div>
                <div class="room-amenities-small">
                  ${room.amenities
                    .slice(0, 3)
                    .map((amenity) => `<span>${amenity}</span>`)
                    .join(" • ")}
                </div>
                <div class="room-result-footer">
                  <div class="price-info">
                    <span class="price-per-night">${formatCurrency(room.pricePerNight)}/noche</span>
                    <span class="total-price">Total: ${formatCurrency(totalPrice)} (${nights} ${nights === 1 ? "noche" : "noches"})</span>
                  </div>
                  <button class="btn btn-primary" data-room-id="${room.id}">Reservar</button>
                </div>
              </div>
            </div>
          `
          })
          .join("")}
      </div>
    `

    // Attach booking button listeners
    resultsContainer.querySelectorAll(".btn-primary").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const roomId = e.target.dataset.roomId
        this.showBookingModal(roomId)
      })
    })
  }

  showBookingModal(roomId) {
    if (!auth.isAuthenticated()) {
      showNotification("Debes iniciar sesión para hacer una reserva", "error")
      setTimeout(() => {
        window.location.href = "auth.html"
      }, 1500)
      return
    }

    const room = this.availableRooms.find((r) => r.id === roomId)
    const nights = calculateNights(this.searchParams.checkIn, this.searchParams.checkOut)
    const totalPrice = room.pricePerNight * nights

    const modal = this.querySelector("#bookingModal")
    const modalBody = this.querySelector("#modalBody")

    modalBody.innerHTML = `
      <h3>Confirmar Reserva</h3>
      <div class="booking-summary">
        <h4>${room.name}</h4>
        <p><strong>Entrada:</strong> ${new Date(this.searchParams.checkIn).toLocaleDateString("es-CO")}</p>
        <p><strong>Salida:</strong> ${new Date(this.searchParams.checkOut).toLocaleDateString("es-CO")}</p>
        <p><strong>Personas:</strong> ${this.searchParams.people}</p>
        <p><strong>Noches:</strong> ${nights}</p>
        <p class="total-price-large"><strong>Total:</strong> ${formatCurrency(totalPrice)}</p>
        <div class="modal-actions">
          <button class="btn btn-primary" id="confirmBooking">Confirmar Reserva</button>
          <button class="btn btn-outline" id="cancelBooking">Cancelar</button>
        </div>
      </div>
    `

    modal.style.display = "flex"

    modalBody.querySelector("#confirmBooking").addEventListener("click", () => {
      this.confirmBooking(room, totalPrice)
    })

    modalBody.querySelector("#cancelBooking").addEventListener("click", () => {
      modal.style.display = "none"
    })
  }

  confirmBooking(room, totalPrice) {
    const user = auth.getCurrentUser()

    const reservation = {
      userId: user.id,
      roomId: room.id,
      roomName: room.name,
      checkIn: this.searchParams.checkIn,
      checkOut: this.searchParams.checkOut,
      people: this.searchParams.people,
      totalPrice: totalPrice,
    }

    db.addReservation(reservation)
    showNotification("Reserva confirmada exitosamente", "success")

    const modal = this.querySelector("#bookingModal")
    modal.style.display = "none"

    // Trigger event to refresh user reservations
    window.dispatchEvent(new CustomEvent("reservation-changed"))

    // Clear search results
    this.querySelector("#searchResults").innerHTML = ""
    this.querySelector("#searchForm").reset()
  }

  getTodayDate() {
    return new Date().toISOString().split("T")[0]
  }

  addStyles() {
    if (!document.getElementById("booking-search-styles")) {
      const style = document.createElement("style")
      style.id = "booking-search-styles"
      style.textContent = `
        .booking-search {
          margin-bottom: var(--spacing-xl);
        }

        .search-form {
          background: var(--color-surface);
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          margin-bottom: var(--spacing-xl);
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .search-results h3 {
          margin-bottom: var(--spacing-lg);
          color: var(--color-primary);
        }

        .rooms-grid {
          display: grid;
          gap: var(--spacing-lg);
        }

        .room-result-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          display: grid;
          grid-template-columns: 300px 1fr;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .room-result-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .room-result-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .room-result-info {
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
        }

        .room-result-info h4 {
          color: var(--color-primary);
          margin-bottom: var(--spacing-sm);
        }

        .room-result-info p {
          color: var(--color-text-light);
          margin-bottom: var(--spacing-md);
        }

        .room-result-details {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
          color: var(--color-text);
          font-size: 0.9rem;
        }

        .room-amenities-small {
          color: var(--color-text-light);
          font-size: 0.875rem;
          margin-bottom: var(--spacing-md);
        }

        .room-result-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .price-info {
          display: flex;
          flex-direction: column;
        }

        .price-per-night {
          color: var(--color-text-light);
          font-size: 0.875rem;
        }

        .total-price {
          color: var(--color-primary);
          font-weight: 600;
          font-size: 1.1rem;
        }

        .no-results {
          background: var(--color-surface);
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
          text-align: center;
          color: var(--color-text-light);
        }

        .modal {
          display: none;
          position: fixed;
          z-index: 10000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background: var(--color-surface);
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
          max-width: 500px;
          width: 90%;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          font-size: 2rem;
          cursor: pointer;
          color: var(--color-text-light);
        }

        .modal-close:hover {
          color: var(--color-text);
        }

        .booking-summary h3 {
          color: var(--color-primary);
          margin-bottom: var(--spacing-lg);
        }

        .booking-summary h4 {
          margin-bottom: var(--spacing-md);
        }

        .booking-summary p {
          margin-bottom: var(--spacing-sm);
          color: var(--color-text);
        }

        .total-price-large {
          font-size: 1.25rem;
          color: var(--color-primary);
          font-weight: 600;
          margin-top: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--color-border);
        }

        .modal-actions {
          display: flex;
          gap: var(--spacing-md);
          margin-top: var(--spacing-lg);
        }

        .modal-actions button {
          flex: 1;
        }

        @media (max-width: 768px) {
          .room-result-card {
            grid-template-columns: 1fr;
          }

          .room-result-card img {
            height: 200px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `
      document.head.appendChild(style)
    }
  }
}

customElements.define("booking-search", BookingSearch)

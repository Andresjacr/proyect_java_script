import { auth } from "../auth.js"
import { db } from "../database.js"
import { formatCurrency, formatDate, showNotification } from "../utils.js"

class AdminPanel extends HTMLElement {
  constructor() {
    super()
    this.activeTab = "stats"
  }

  connectedCallback() {
    // Check if user is admin
    if (!auth.isAdmin()) {
      this.innerHTML = `
        <div class="access-denied">
          <h3>Acceso Denegado</h3>
          <p>No tienes permisos para acceder a esta página</p>
          <a href="index.html" class="btn btn-primary">Volver al Inicio</a>
        </div>
      `
      this.addStyles()
      return
    }

    this.render()
  }

  render() {
    this.innerHTML = `
      <div class="admin-panel">
        <div class="admin-tabs">
          <button class="tab-btn ${this.activeTab === "stats" ? "active" : ""}" data-tab="stats">
            Estadísticas
          </button>
          <button class="tab-btn ${this.activeTab === "reservations" ? "active" : ""}" data-tab="reservations">
            Reservas
          </button>
          <button class="tab-btn ${this.activeTab === "rooms" ? "active" : ""}" data-tab="rooms">
            Habitaciones
          </button>
          
        </div>

        <div class="admin-content">
          ${this.renderTabContent()}
        </div>
      </div>
    `

    this.addStyles()
    this.attachEventListeners()
  }

  renderTabContent() {
    switch (this.activeTab) {
      case "stats":
        return this.renderStats()
      case "reservations":
        return this.renderReservations()
      case "rooms":
        return this.renderRooms()
      default:
        return ""
    }
  }

  renderStats() {
    const reservations = db.getReservations()
    const rooms = db.getRooms()
    const users = db.getUsers()

    const confirmedReservations = reservations.filter((r) => r.status === "confirmed")
    const totalRevenue = confirmedReservations.reduce((sum, r) => sum + r.totalPrice, 0)

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <h4>Total Reservas</h4>
          <p class="stat-number">${reservations.length}</p>
        </div>
        <div class="stat-card">
          <h4>Reservas Confirmadas</h4>
          <p class="stat-number">${confirmedReservations.length}</p>
        </div>
        <div class="stat-card">
          <h4>Total Habitaciones</h4>
          <p class="stat-number">${rooms.length}</p>
        </div>
        <div class="stat-card">
          <h4>Total Usuarios</h4>
          <p class="stat-number">${users.length}</p>
        </div>
        <div class="stat-card stat-card-large">
          <h4>Ingresos Totales</h4>
          <p class="stat-number">${formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      <div class="recent-activity">
        <h3>Actividad Reciente</h3>
        ${
          reservations.length > 0
            ? `
          <div class="activity-list">
            ${reservations
              .slice(-5)
              .reverse()
              .map(
                (res) => `
              <div class="activity-item">
                <p><strong>${res.roomName}</strong> - ${res.status === "confirmed" ? "Confirmada" : "Cancelada"}</p>
                <p class="activity-date">${formatDate(res.createdAt)}</p>
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : "<p>No hay actividad reciente</p>"
        }
      </div>
    `
  }

  renderReservations() {
    const reservations = db.getReservations()

    if (reservations.length === 0) {
      return "<p>No hay reservas registradas</p>"
    }

    return `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Habitación</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Personas</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${reservations
              .map(
                (res) => `
              <tr>
                <td>${res.id}</td>
                <td>${res.roomName}</td>
                <td>${formatDate(res.checkIn)}</td>
                <td>${formatDate(res.checkOut)}</td>
                <td>${res.people}</td>
                <td>${formatCurrency(res.totalPrice)}</td>
                <td>
                  <span class="status-badge status-${res.status}">
                    ${res.status === "confirmed" ? "Confirmada" : "Cancelada"}
                  </span>
                </td>
                <td>
                  ${
                    res.status === "confirmed"
                      ? `<button class="btn-small btn-danger" data-action="cancel" data-id="${res.id}">Cancelar</button>`
                      : "-"
                  }
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
  }

  renderRooms() {
    const rooms = db.getRooms()

    return `
      <div class="add-room-form">
        <h3>Agregar nueva habitación</h3>
        <form id="formAddRoom">
          <input type="text" id="roomName" placeholder="Nombre" required>
          <textarea id="roomDescription" placeholder="Descripción" required></textarea>
          <input type="number" id="roomBeds" placeholder="Número de camas" required min="1">
          <input type="number" id="roomMaxPeople" placeholder="Capacidad máxima" required min="1">
          <input type="number" id="roomPrice" placeholder="Precio por noche" required min="0" step="1000">
          <input type="text" id="roomAmenities" placeholder="Amenidades (separadas por comas)" required>
          
          <!-- Added image upload functionality with preview -->
          <div class="image-upload-section">
            <label class="image-upload-label">
              <span>Imagen de la habitación</span>
              <div class="image-upload-options">
                <div class="upload-option">
                  <input type="file" id="roomImageFile" accept="image/*" class="file-input">
                  <label for="roomImageFile" class="btn-small btn-secondary">Subir Imagen</label>
                </div>
                <span class="option-separator">o</span>
                <div class="upload-option">
                  <input type="text" id="roomImageUrl" placeholder="URL de la imagen">
                </div>
              </div>
            </label>
            <div id="imagePreview" class="image-preview"></div>
          </div>
          
          <button type="submit" class="btn-small btn-primary">Agregar habitación</button>
        </form>
      </div>

      <div class="rooms-admin-grid">
        ${rooms
          .map(
            (room) => `
          <div class="room-admin-card">
            <img src="${room.image}" alt="${room.name}">
            <div class="room-admin-info">
              <h4>${room.name}</h4>
              <p>${room.description}</p>
              <div class="room-admin-details">
                <p><strong>Camas:</strong> ${room.beds}</p>
                <p><strong>Max Personas:</strong> ${room.maxPeople}</p>
                <p><strong>Precio:</strong> ${formatCurrency(room.pricePerNight)}/noche</p>
                <p><strong>Estado:</strong> ${room.active ? "Activa" : "Inactiva"}</p>
              </div>
              <div class="room-admin-actions">
                <input 
                  type="number" 
                  class="price-input" 
                  value="${room.pricePerNight}" 
                  data-room-id="${room.id}"
                  placeholder="Nuevo precio"
                >
                <button class="btn-small btn-primary" data-action="update-price" data-id="${room.id}">
                  Actualizar Precio
                </button>
                <button class="btn-small ${room.active ? "btn-danger" : "btn-secondary"}" 
                        data-action="toggle-active" data-id="${room.id}">
                  ${room.active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `
  }

  attachEventListeners() {
    // Tab switching
    const tabButtons = this.querySelectorAll(".tab-btn")
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.activeTab = e.target.dataset.tab
        this.render()
      })
    })

    // Reservation actions
    const reservationActions = this.querySelectorAll('[data-action="cancel"]')
    reservationActions.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id
        if (confirm("¿Cancelar esta reserva?")) {
          db.cancelReservation(id)
          showNotification("Reserva cancelada", "success")
          this.render()
        }
      })
    })

    // Room actions
    const updatePriceButtons = this.querySelectorAll('[data-action="update-price"]')
    updatePriceButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id
        const input = this.querySelector(`.price-input[data-room-id="${id}"]`)
        const newPrice = Number.parseInt(input.value)

        if (newPrice && newPrice > 0) {
          db.updateRoom(id, { pricePerNight: newPrice })
          showNotification("Precio actualizado", "success")
          this.render()
        } else {
          showNotification("Precio inválido", "error")
        }
      })
    })

    const toggleActiveButtons = this.querySelectorAll('[data-action="toggle-active"]')
    toggleActiveButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id
        const room = db.getRoomById(id)
        db.updateRoom(id, { active: !room.active })
        showNotification(`Habitación ${room.active ? "desactivada" : "activada"}`, "success")
        this.render()
      })
    })

    const fileInput = this.querySelector("#roomImageFile")
    const urlInput = this.querySelector("#roomImageUrl")
    const imagePreview = this.querySelector("#imagePreview")

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const imageData = event.target.result
            imagePreview.innerHTML = `
              <img src="${imageData}" alt="Preview">
              <p class="preview-label">Vista previa</p>
            `
            // Clear URL input when file is selected
            urlInput.value = ""
          }
          reader.readAsDataURL(file)
        }
      })
    }

    if (urlInput) {
      urlInput.addEventListener("input", (e) => {
        const url = e.target.value
        if (url) {
          imagePreview.innerHTML = `
            <img src="${url}" alt="Preview" onerror="this.src='public/placeholder.jpg'">
            <p class="preview-label">Vista previa</p>
          `
          // Clear file input when URL is entered
          if (fileInput) fileInput.value = ""
        } else {
          imagePreview.innerHTML = ""
        }
      })
    }

    const formAddRoom = this.querySelector("#formAddRoom")
    if (formAddRoom) {
      formAddRoom.addEventListener("submit", (e) => {
        e.preventDefault()

        const amenitiesInput = this.querySelector("#roomAmenities").value
        const amenitiesArray = amenitiesInput
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0)

        const imageUrl = this.querySelector("#roomImageUrl").value
        const fileInput = this.querySelector("#roomImageFile")

        if (fileInput.files && fileInput.files[0]) {
          // If file is uploaded, use the data URL
          const reader = new FileReader()
          reader.onload = (event) => {
            const newRoom = {
              id: Date.now().toString(),
              name: this.querySelector("#roomName").value,
              description: this.querySelector("#roomDescription").value,
              beds: Number.parseInt(this.querySelector("#roomBeds").value),
              maxPeople: Number.parseInt(this.querySelector("#roomMaxPeople").value),
              pricePerNight: Number.parseFloat(this.querySelector("#roomPrice").value),
              image: event.target.result,
              amenities: amenitiesArray.length > 0 ? amenitiesArray : ["WiFi", "TV"],
              active: true,
            }

            db.addRoom(newRoom)
            showNotification("Nueva habitación agregada", "success")
            this.render()
          }
          reader.readAsDataURL(fileInput.files[0])
        } else if (imageUrl) {
          // If URL is provided, use it
          const newRoom = {
            id: Date.now().toString(),
            name: this.querySelector("#roomName").value,
            description: this.querySelector("#roomDescription").value,
            beds: Number.parseInt(this.querySelector("#roomBeds").value),
            maxPeople: Number.parseInt(this.querySelector("#roomMaxPeople").value),
            pricePerNight: Number.parseFloat(this.querySelector("#roomPrice").value),
            image: imageUrl,
            amenities: amenitiesArray.length > 0 ? amenitiesArray : ["WiFi", "TV"],
            active: true,
          }

          db.addRoom(newRoom)
          showNotification("Nueva habitación agregada", "success")
          this.render()
        } else {
          showNotification("Por favor, sube una imagen o proporciona una URL", "error")
        }
      })
    }
  }

  addStyles() {
    if (!document.getElementById("admin-panel-styles")) {
      const style = document.createElement("style")
      style.id = "admin-panel-styles"
      style.textContent = `
        .access-denied {
          background: var(--color-surface);
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .access-denied h3 {
          color: var(--color-error);
          margin-bottom: var(--spacing-md);
        }

        .access-denied p {
          color: var(--color-text-light);
          margin-bottom: var(--spacing-lg);
        }

        .admin-panel {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }

        .admin-tabs {
          display: flex;
          border-bottom: 2px solid var(--color-border);
        }

        .tab-btn {
          flex: 1;
          padding: var(--spacing-md);
          background: none;
          border: none;
          font-size: 1rem;
          font-weight: 500;
          color: var(--color-text-light);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-btn:hover {
          background: var(--color-background);
        }

        .tab-btn.active {
          color: var(--color-primary);
          border-bottom: 3px solid var(--color-primary);
        }

        .admin-content {
          padding: var(--spacing-lg);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .stat-card {
          background: var(--color-background);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          text-align: center;
        }

        .stat-card h4 {
          color: var(--color-text-light);
          font-size: 0.9rem;
          margin-bottom: var(--spacing-sm);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .stat-card-large {
          grid-column: span 2;
        }

        .recent-activity h3 {
          color: var(--color-primary);
          margin-bottom: var(--spacing-md);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .activity-item {
          background: var(--color-background);
          padding: var(--spacing-sm);
          border-radius: var(--radius-sm);
        }

        .activity-item p {
          margin: 0;
          color: var(--color-text);
        }

        .activity-date {
          font-size: 0.875rem;
          color: var(--color-text-light);
        }

        .admin-table-container {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-table th,
        .admin-table td {
          padding: var(--spacing-sm);
          text-align: left;
          border-bottom: 1px solid var(--color-border);
        }

        .admin-table th {
          background: var(--color-background);
          font-weight: 600;
          color: var(--color-text);
        }

        .admin-table td {
          color: var(--color-text);
        }

        .btn-small {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-small.btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-small.btn-primary:hover {
          background: var(--color-primary-dark);
        }

        .btn-small.btn-danger {
          background: var(--color-error);
          color: white;
        }

        .btn-small.btn-danger:hover {
          background: #b83838;
        }

        .btn-small.btn-secondary {
          background: var(--color-secondary);
          color: white;
        }

        .btn-small.btn-secondary:hover {
          background: var(--color-secondary-dark);
        }

        .rooms-admin-grid {
          display: grid;
          gap: var(--spacing-lg);
        }

        .room-admin-card {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: var(--spacing-md);
          background: var(--color-background);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .room-admin-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .room-admin-info {
          padding: var(--spacing-md);
        }

        .room-admin-info h4 {
          color: var(--color-primary);
          margin-bottom: var(--spacing-sm);
        }

        .room-admin-info p {
          color: var(--color-text-light);
          margin-bottom: var(--spacing-md);
        }

        .room-admin-details {
          margin-bottom: var(--spacing-md);
        }

        .room-admin-details p {
          margin-bottom: var(--spacing-xs);
          color: var(--color-text);
        }

        .room-admin-actions {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
          align-items: center;
        }

        .price-input {
          padding: 0.375rem 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          width: 150px;
        }

        @media (max-width: 768px) {
          .stat-card-large {
            grid-column: span 1;
          }

          .room-admin-card {
            grid-template-columns: 1fr;
          }

          .room-admin-card img {
            height: 200px;
          }

          .admin-table {
            font-size: 0.875rem;
          }
        }

        .add-room-form {
          margin-bottom: var(--spacing-xl);
          background: var(--color-background);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
        }

        .add-room-form form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .add-room-form input,
        .add-room-form textarea {
          padding: 0.5rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
        }
        
        /* Added styles for image upload section */
        .image-upload-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
        
        .image-upload-label {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .image-upload-label > span {
          font-weight: 500;
          color: var(--color-text);
        }
        
        .image-upload-options {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }
        
        .upload-option {
          flex: 1;
          min-width: 200px;
        }
        
        .file-input {
          display: none;
        }
        
        .option-separator {
          color: var(--color-text-light);
          font-weight: 500;
        }
        
        .image-preview {
          margin-top: var(--spacing-sm);
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-sm);
          padding: var(--spacing-sm);
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--color-surface);
        }
        
        .image-preview img {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
          border-radius: var(--radius-sm);
        }
        
        .preview-label {
          margin-top: var(--spacing-xs);
          color: var(--color-text-light);
          font-size: 0.875rem;
        }
        
        .image-preview:empty {
          display: none;
        }
      `
      document.head.appendChild(style)
    }
  }
}

customElements.define("admin-panel", AdminPanel)

import { db } from "../database.js"
import { formatCurrency } from "../utils.js"

class RoomCarousel extends HTMLElement {
  constructor() {
    super()
    this.currentIndex = 0
    this.rooms = []
  }

  connectedCallback() {
    this.rooms = db.getActiveRooms()
    this.render()
    this.startAutoPlay()
  }

  disconnectedCallback() {
    this.stopAutoPlay()
  }

  render() {
    if (this.rooms.length === 0) {
      this.innerHTML = "<p>No hay habitaciones disponibles</p>"
      return
    }

    const room = this.rooms[this.currentIndex]

    this.innerHTML = `
      <div class="carousel">
        <div class="carousel-content">
          <img src="${room.image}" alt="${room.name}" class="carousel-image">
          <div class="carousel-info">
            <h3>${room.name}</h3>
            <p>${room.description}</p>
            <div class="room-details">
              <span>${room.beds} ${room.beds === 1 ? "Cama" : "Camas"}</span>
              <span>Hasta ${room.maxPeople} personas</span>
              <span class="room-price">${formatCurrency(room.pricePerNight)}/noche</span>
            </div>
            <div class="room-amenities">
              ${room.amenities.map((amenity) => `<span class="amenity-tag">${amenity}</span>`).join("")}
            </div>
          </div>
        </div>
        <div class="carousel-controls">
          <button class="carousel-btn prev" aria-label="Anterior">‹</button>
          <div class="carousel-dots">
            ${this.rooms.map((_, i) => `<span class="dot ${i === this.currentIndex ? "active" : ""}"></span>`).join("")}
          </div>
          <button class="carousel-btn next" aria-label="Siguiente">›</button>
        </div>
      </div>
    `

    this.addStyles()
    this.attachEventListeners()
  }

  attachEventListeners() {
    const prevBtn = this.querySelector(".prev")
    const nextBtn = this.querySelector(".next")
    const dots = this.querySelectorAll(".dot")

    prevBtn?.addEventListener("click", () => this.prev())
    nextBtn?.addEventListener("click", () => this.next())

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => this.goTo(index))
    })
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.rooms.length) % this.rooms.length
    this.render()
    this.resetAutoPlay()
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.rooms.length
    this.render()
    this.resetAutoPlay()
  }

  goTo(index) {
    this.currentIndex = index
    this.render()
    this.resetAutoPlay()
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => this.next(), 5000)
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval)
    }
  }

  resetAutoPlay() {
    this.stopAutoPlay()
    this.startAutoPlay()
  }

  addStyles() {
    if (!document.getElementById("carousel-styles")) {
      const style = document.createElement("style")
      style.id = "carousel-styles"
      style.textContent = `
        .carousel {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
        }

        .carousel-content {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .carousel-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
        }

        .carousel-info {
          padding: var(--spacing-lg);
        }

        .carousel-info h3 {
          color: var(--color-primary);
          margin-bottom: var(--spacing-sm);
        }

        .carousel-info p {
          color: var(--color-text-light);
          margin-bottom: var(--spacing-md);
        }

        .room-details {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          flex-wrap: wrap;
        }

        .room-details span {
          color: var(--color-text);
          font-size: 0.9rem;
        }

        .room-price {
          color: var(--color-primary);
          font-weight: 600;
          font-size: 1.1rem !important;
        }

        .room-amenities {
          display: flex;
          gap: var(--spacing-xs);
          flex-wrap: wrap;
        }

        .amenity-tag {
          background: var(--color-background);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          color: var(--color-text);
        }

        .carousel-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--spacing-md);
          padding: 0 var(--spacing-md);
        }

        .carousel-btn {
          background: var(--color-primary);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          transition: background 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel-btn:hover {
          background: var(--color-primary-dark);
        }

        .carousel-dots {
          display: flex;
          gap: var(--spacing-xs);
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--color-border);
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .dot.active {
          background: var(--color-primary);
        }

        @media (max-width: 768px) {
          .carousel-image {
            height: 250px;
          }

          .room-details {
            flex-direction: column;
            gap: var(--spacing-xs);
          }
        }
      `
      document.head.appendChild(style)
    }
  }
}

customElements.define("room-carousel", RoomCarousel)

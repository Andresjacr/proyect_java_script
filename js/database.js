// Database Management with localStorage

class Database {
  constructor() {
    this.init()
  }

  init() {
    // Initialize default data if not exists
    if (!localStorage.getItem("hotel_users")) {
      const defaultUsers = [
        {
          id: "1",
          documentId: "admin123",
          fullName: "Administrador",
          nationality: "Colombia",
          email: "admin@rincondelcarmen.com",
          phone: "+57 300 123 4567",
          password: "admin123",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem("hotel_users", JSON.stringify(defaultUsers))
    }

    if (!localStorage.getItem("hotel_rooms")) {
      const defaultRooms = [
        {
          id: "1",
          name: "Suite Presidencial",
          description: "Nuestra suite más lujosa con vista panorámica",
          beds: 1,
          maxPeople: 2,
          pricePerNight: 450000,
          amenities: ["WiFi", "Minibar", "Jacuzzi", 'TV 55"', "Balcón", "Room Service"],
          image: "../imgs/suit_presidencial.jpg",
          active: true,
        },
        {
          id: "2",
          name: "Habitación Deluxe",
          description: "Habitación espaciosa con todas las comodidades",
          beds: 1,
          maxPeople: 2,
          pricePerNight: 280000,
          amenities: ["WiFi", "Minibar", 'TV 43"', "Aire Acondicionado"],
          image: "../imgs/otraHabitacion.jpg",
          active: true,
        },
        {
          id: "3",
          name: "Habitación Familiar",
          description: "Perfecta para familias, con dos camas dobles",
          beds: 2,
          maxPeople: 4,
          pricePerNight: 350000,
          amenities: ["WiFi", 'TV 43"', "Aire Acondicionado", "Cafetera"],
          image: "../imgs/habitacionFamiliar.jpeg",
          active: true,
        },
      ]
      localStorage.setItem("hotel_rooms", JSON.stringify(defaultRooms))
    }

    if (!localStorage.getItem("hotel_reservations")) {
      localStorage.setItem("hotel_reservations", JSON.stringify([]))
    }
  }

  // Users
  getUsers() {
    return JSON.parse(localStorage.getItem("hotel_users") || "[]")
  }

  getUserByEmail(email) {
    const users = this.getUsers()
    return users.find((user) => user.email === email)
  }

  addUser(user) {
    const users = this.getUsers()
    const newUser = {
      ...user,
      id: Date.now().toString(),
      role: "guest",
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    localStorage.setItem("hotel_users", JSON.stringify(users))
    return newUser
  }

  // Rooms
  getRooms() {
    return JSON.parse(localStorage.getItem("hotel_rooms") || "[]")
  }

  getActiveRooms() {
    return this.getRooms().filter((room) => room.active)
  }

  getRoomById(id) {
    const rooms = this.getRooms()
    return rooms.find((room) => room.id === id)
  }

  updateRoom(id, updates) {
    const rooms = this.getRooms()
    const index = rooms.findIndex((room) => room.id === id)
    if (index !== -1) {
      rooms[index] = { ...rooms[index], ...updates }
      localStorage.setItem("hotel_rooms", JSON.stringify(rooms))
      return rooms[index]
    }
    return null
  }

  addRoom(room) {
    const rooms = this.getRooms()
    const newRoom = {
      ...room,
      id: room.id || Date.now().toString(),
      active: true,
    }
    rooms.push(newRoom)
    localStorage.setItem("hotel_rooms", JSON.stringify(rooms))
    return newRoom
  }

  // Reservations
  getReservations() {
    return JSON.parse(localStorage.getItem("hotel_reservations") || "[]")
  }

  getReservationsByUserId(userId) {
    const reservations = this.getReservations()
    return reservations.filter((res) => res.userId === userId)
  }

  addReservation(reservation) {
    const reservations = this.getReservations()
    const newReservation = {
      ...reservation,
      id: Date.now().toString(),
      status: "confirmed",
      createdAt: new Date().toISOString(),
    }
    reservations.push(newReservation)
    localStorage.setItem("hotel_reservations", JSON.stringify(reservations))
    return newReservation
  }

  cancelReservation(id) {
    const reservations = this.getReservations()
    const index = reservations.findIndex((res) => res.id === id)
    if (index !== -1) {
      reservations[index].status = "cancelled"
      localStorage.setItem("hotel_reservations", JSON.stringify(reservations))
      return reservations[index]
    }
    return null
  }

  updateReservation(id, updates) {
    const reservations = this.getReservations()
    const index = reservations.findIndex((res) => res.id === id)
    if (index !== -1) {
      reservations[index] = { ...reservations[index], ...updates }
      localStorage.setItem("hotel_reservations", JSON.stringify(reservations))
      return reservations[index]
    }
    return null
  }

  // Check availability
  isRoomAvailable(roomId, checkIn, checkOut) {
    const reservations = this.getReservations()
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    return !reservations.some((res) => {
      if (res.roomId !== roomId || res.status === "cancelled") return false

      const resCheckIn = new Date(res.checkIn)
      const resCheckOut = new Date(res.checkOut)

      return checkInDate < resCheckOut && checkOutDate > resCheckIn
    })
  }

  getAvailableRooms(checkIn, checkOut, people) {
    const rooms = this.getActiveRooms()
    return rooms.filter((room) => {
      if (room.maxPeople < people) return false
      return this.isRoomAvailable(room.id, checkIn, checkOut)
    })
  }
}

// Export singleton instance
export const db = new Database()

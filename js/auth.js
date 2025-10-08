// Authentication Management

class AuthManager {
  constructor() {
    this.currentUser = null
    this.loadCurrentUser()
  }

  loadCurrentUser() {
    const userJson = sessionStorage.getItem("hotel_current_user")
    if (userJson) {
      this.currentUser = JSON.parse(userJson)
    }
  }

  saveCurrentUser(user) {
    this.currentUser = user
    sessionStorage.setItem("hotel_current_user", JSON.stringify(user))
  }

  clearCurrentUser() {
    this.currentUser = null
    sessionStorage.removeItem("hotel_current_user")
  }

  getCurrentUser() {
    return this.currentUser
  }

  isAuthenticated() {
    return this.currentUser !== null
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === "admin"
  }

  login(email, password) {
    const { db } = window
    const user = db.getUserByEmail(email)

    if (!user) {
      throw new Error("Usuario no encontrado")
    }

    if (user.password !== password) {
      throw new Error("Contraseña incorrecta")
    }

    this.saveCurrentUser(user)
    return user
  }

  register(userData) {
    const { db } = window

    // Check if email already exists
    const existingUser = db.getUserByEmail(userData.email)
    if (existingUser) {
      throw new Error("El correo electrónico ya está registrado")
    }

    const newUser = db.addUser(userData)
    this.saveCurrentUser(newUser)
    return newUser
  }

  logout() {
    this.clearCurrentUser()
    window.location.href = "index.html"
  }
}

// Export singleton instance
export const auth = new AuthManager()

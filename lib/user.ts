export interface User {
  id: string
  name: string
  email: string
}

// V0: Simple current user mock
export const getCurrentUser = (): User => {
  return {
    id: "user-1",
    name: "Current User",
    email: "user@example.com",
  }
}

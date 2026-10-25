/** Role names as stored in the Rails `roles` table, e.g. "Admin", "HR Manager", "Software Engineer". */
export type RoleName = string

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: RoleName
}

export interface SignInCredentials {
  email: string
  password: string
}

import type { UUID } from "@shared/types/utility.types"

export type User = {
  id : UUID
  name : string
  email : string
  googleId: string
}

export type NewUser = Pick<User,"name"|"email"|"googleId">
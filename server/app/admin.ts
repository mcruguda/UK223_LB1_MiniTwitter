import { User } from './User'

export class Admin extends User {
  constructor(userId: number, username: string, password: string) {
    super(userId, username, password)
  }
}

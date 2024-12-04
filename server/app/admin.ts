import { User } from './user'

export class Admin extends User {
  constructor(userId: number, username: string, password: string) {
    super(userId, username, password)
  }
}

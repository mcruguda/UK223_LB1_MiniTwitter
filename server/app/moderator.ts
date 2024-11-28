import { User } from './User'

export class Moderator extends User {
  constructor(userId: number, username: string, password: string) {
    super(userId, username, password)
  }
}

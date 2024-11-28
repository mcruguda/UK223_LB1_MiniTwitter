class User {
  userId: number
  username: string
  password: string
  posts?: Post[]
  comments?: TwitterComment[]
  likes?: Like[]

  constructor(userId: number, username: string, password: string) {
    this.userId = userId
    this.username = username
    this.password = password
  }
}

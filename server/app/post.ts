class Post {
  content: string
  postDate: Date
  postUser: User
  comments?: TwitterComment[]
  likes?: Like[]
  constructor(content: string, postDate, postUser) {
    this.content = content
    this.postDate = postDate
    this.postUser = postUser
  }
}

import { User } from './user'
import { TwitterComment } from './comment'
import { Like } from './like'

export class Post {
  content: string
  postDate: Date
  userId: number
  comments?: TwitterComment[]
  likes?: Like[]
  constructor(content: string, postDate: Date, postUserId: number) {
    this.content = content
    this.postDate = postDate
    this.userId = postUserId
  }
}

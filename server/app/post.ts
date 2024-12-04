import { User } from './user'
import { TwitterComment } from './comment'
import { Like } from './like'

export class Post {
  postId: number
  content: string
  postDate: Date
  userId: number
  comments?: TwitterComment[]
  likes?: Like[]
  constructor(
    postId: number,
    content: string,
    postDate: Date,
    postUserId: number
  ) {
    this.likes = []
    this.comments = []
    this.postId = postId
    this.content = content
    this.postDate = postDate
    this.userId = postUserId
  }

  public loadComment(comment: TwitterComment) {
    this.comments?.push(comment)
  }

  public get getPostId(): number {
    return this.postId
  }

  public loadLike(like: Like) {
    this.likes?.push(like)
  }
}

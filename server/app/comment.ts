import { Post } from './post'
import { Like } from './like'
import { User } from './User'

export class TwitterComment {
  content: string
  commentedPost: Post
  postDate: Date
  commentUser: User
  likes?: Like[]
  comment?: TwitterComment
  constructor(
    content: string,
    commentedPost: Post,
    postDate: Date,
    commentUser: User
  ) {
    this.content = content
    this.commentedPost = commentedPost
    this.postDate = postDate
    this.commentUser = commentUser
  }
}

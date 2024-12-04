import { Post } from './post'
import { Like } from './like'
import { User } from './user'

export class TwitterComment {
  commentId: number
  content: string
  commentedPostId: number
  postDate: Date
  commentUserId: number
  likes?: Like[]
  comment?: TwitterComment
  constructor(
    commentId: number,
    content: string,
    commentedPostId: number,
    postDate: Date,
    commentUserId: number
  ) {
    this.commentId = commentId
    this.content = content
    this.commentedPostId = commentedPostId
    this.postDate = postDate
    this.commentUserId = commentUserId
  }
}

import { User } from './User'
import { Post } from './post'
import { TwitterComment } from './comment'

export class Like {
  likedPost?: Post
  likedComment?: TwitterComment
  user: User
  constructor(user: User, likedPost?: Post, likedComment?: TwitterComment) {
    this.user = user
    if (likedPost) {
      this.likedPost = likedPost
    } else {
      this.likedComment = likedComment
    }
  }
}

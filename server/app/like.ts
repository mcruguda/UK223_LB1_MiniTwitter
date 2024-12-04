import { User } from './user'
import { Post } from './post'
import { TwitterComment } from './comment'

export class Like {
  likedPostId: number
  userId: number
  isPositive: boolean
  constructor(userId: number, likedPostId: number, isPositive: boolean) {
    this.likedPostId = likedPostId
    this.userId = userId
    this.isPositive = isPositive
  }
}

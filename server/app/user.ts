import { Post } from './post'
import { TwitterComment } from './comment'
import { Like } from './like'

export class User {
  private userId: number
  username: string
  private password: string
  posts?: Post[]
  comments?: TwitterComment[]
  private likes?: Like[]

  constructor(userId: number, username: string, password: string) {
    this.userId = userId
    this.username = username
    this.password = password
  }

  public get getUserId(): number {
    return this.userId
  }

  public postTweet(tweetContent: string, date: Date, userId: number) {
    const newTweet = new Post(tweetContent, date, userId)
    this.posts?.push(newTweet)
  }
}

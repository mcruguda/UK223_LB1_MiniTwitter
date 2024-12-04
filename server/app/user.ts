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
    this.comments = []
    this.posts = []
    this.likes = []
    this.userId = userId
    this.username = username
    this.password = password
  }

  public get getUserId(): number {
    return this.userId
  }

  public postTweet(
    id: number,
    tweetContent: string,
    date: Date,
    userId: number
  ) {
    const newTweet = new Post(id, tweetContent, date, userId)
    this.posts?.push(newTweet)
  }

  public loadTweet(tweet: Post) {
    this.posts?.push(tweet)
  }

  public loadComment(comment: TwitterComment) {
    this.comments?.push(comment)
  }

  public loadLike(like: Like) {
    this.likes?.push(like)
  }
}

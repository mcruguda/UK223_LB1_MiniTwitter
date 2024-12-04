import { Request, Response, Express } from 'express'
import { Database } from '../database'
import bcrypt from 'bcrypt'
import { query, body, validationResult, matchedData } from 'express-validator'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { User } from '../app/user'
import { Admin } from '../app/admin'
import { Moderator } from '../app/moderator'
import { Post } from '../app/post'
import { JwtMiddleware } from './jwtMiddleware'
import * as path from 'path'
import { TwitterComment } from '../app/comment'
import { Like } from '../app/like'
dotenv.config()

export class API {
  // Properties
  app: Express
  db: Database
  secretKey = process.env.SECRET_KEY
  twitterUsers: User[]
  posts: Post[]
  jwtMiddleware = new JwtMiddleware()
  // Constructor
  constructor(app: Express, db: Database) {
    this.twitterUsers = []
    this.posts = []
    this.app = app
    this.app.get('/hello', this.sayHello)
    this.app.post(
      '/api/register',
      body('username')
        .isString()
        .withMessage('Username must be string')
        .notEmpty()
        .withMessage('Username cannot be empty!')
        .custom(async (username) => {
          if (!(await this.checkUsernameAvailability(username)))
            throw new Error('Username exists.')
        })
        .escape(),
      this.register
    )
    this.app.post(
      '/api/login',
      body('username')
        .isString()
        .withMessage('Username must be string')
        .notEmpty()
        .withMessage('Username cannot be empty!')
        .escape(),
      this.login
    )
    this.app.post(
      '/api/postTweet',
      body('tweetContent')
        .isString()
        .withMessage('The Tweet content must be a String')
        .notEmpty()
        .withMessage('You cannot post an empty Tweet.')
        .escape(),
      this.jwtMiddleware.verifyToken,
      this.createTweet
    )
    this.app.put(
      '/api/editTweet',
      query('postId')
        .isNumeric()
        .withMessage('The request Query must be a number!')
        .notEmpty()
        .withMessage('You cannot edit a Post without an ID!')
        .escape(),
      body('tweetContent')
        .isString()
        .withMessage('The Tweet content must be a String')
        .notEmpty()
        .withMessage('Yor cannot edit a tweet to be empty')
        .escape(),
      this.jwtMiddleware.verifyToken,
      this.editTweet
    )
    this.app.delete(
      '/api/deleteTweet',
      query('postId')
        .isNumeric()
        .withMessage('The request Query must be a number!')
        .notEmpty()
        .withMessage('You cannot delete a Post without an ID!')
        .escape(),
      this.jwtMiddleware.verifyToken,
      this.deleteTweet
    )
    this.app.post(
      '/api/createComment',
      query('postId')
        .isNumeric()
        .withMessage('The request Query must be a number!')
        .notEmpty()
        .withMessage('You comment must comment on a post!')
        .escape(),
      body('commentContent')
        .isString()
        .withMessage('The comment content must be a String')
        .notEmpty()
        .withMessage('You cannot post an empty comment.')
        .escape(),
      this.jwtMiddleware.verifyToken,
      this.createComment
    )
    this.app.put(
      '/api/editComment',
      query('commentId')
        .isNumeric()
        .withMessage('The request Query must be a number!')
        .notEmpty()
        .withMessage('You cannot edit a comment without an ID!')
        .escape(),
      body('commentContent')
        .isString()
        .withMessage('The Comment content must be a String')
        .notEmpty()
        .withMessage('Yor cannot edit a comment to be empty')
        .escape(),
      this.jwtMiddleware.verifyToken,
      this.editComment
    )
    this.app.delete(
      '/api/deleteComment',
      query('commentId')
        .isNumeric()
        .withMessage('The request Query must be a number!')
        .notEmpty()
        .withMessage('You cannot delete a Comment without an ID!')
        .escape(),
      this.jwtMiddleware.verifyToken,
      this.deleteComment
    )
    this.app.post(
      '/api/like',
      query('postId')
        .isNumeric()
        .withMessage('The request Query must be a number!')
        .notEmpty()
        .withMessage('You cannot like a Post without an ID!')
        .escape(),
      body('isPositive')
        .isBoolean()
        .withMessage('isPositive must be a boolean')
        .escape(),
      this.jwtMiddleware.verifyToken,
      this.like
    )
    this.app.get('/api/getPosts', this.showTweets)
    this.app.get('/api/getTweet/:id', this.showSpecificTweet)
    this.db = db
    this.loadObjects()
  }
  // Methods
  private sayHello(req: Request, res: Response) {
    res.send('Hello There!')
  }

  private register = async (req: Request, res: Response): Promise<void> => {
    const validationRes = validationResult(req)
    if (!validationRes.isEmpty()) {
      return res.status(400).send(validationRes.array()[0].msg)
    }

    const { password } = req.body
    const { username } = matchedData(req)
    const role = 'User'
    const hashedPassword = await bcrypt.hash(password, 10)
    const insertUser = `
    INSERT INTO \`users\`(\`username\`, \`password\`, \`role_id\`) VALUES ('${username}','${hashedPassword}',(SELECT \`id\` FROM \`roles\` WHERE \`name\` = '${role}')); 
    `
    this.db.executeSQL(insertUser)
    return res.sendStatus(200)
  }

  private login = async (req: Request, res: Response): Promise<void> => {
    const validationRes = validationResult(req)
    if (!validationRes.isEmpty()) {
      return res.status(400).send(validationRes.array()[0].msg)
    }

    const { password } = req.body
    const { username } = matchedData(req)

    const selectUserQuery = `
      SELECT * FROM \`users\` WHERE \`username\` = '${username}'
    `
    const userInfo = await this.db.executeSQL(selectUserQuery)

    if (userInfo.length === 0)
      return res.status(401).send('Username or Password is incorrect!')

    const checkPassword = bcrypt.compareSync(password, userInfo[0].password)

    if (checkPassword) {
      const userId = userInfo[0].id
      const jwtToken = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
          data: { userId },
        },
        this.secretKey
      )
      return res.status(200).send({ token: jwtToken })
    }

    return res.status(401).send('Username or Password is incorrect!')
  }

  private createTweet = async (req: Request, res: Response): Promise<void> => {
    const validationRes = validationResult(req)
    if (!validationRes.isEmpty()) {
      return res.status(400).send(validationRes.array()[0].msg)
    }

    const { id } = req.body
    const { tweetContent } = matchedData(req)

    // https://stackoverflow.com/questions/20083807/javascript-date-to-sql-date-object
    let pad = function (num) {
      return ('00' + num).slice(-2)
    }
    let date
    date = new Date()
    date =
      date.getUTCFullYear() +
      '-' +
      pad(date.getUTCMonth() + 1) +
      '-' +
      pad(date.getUTCDate()) +
      ' ' +
      pad(date.getUTCHours()) +
      ':' +
      pad(date.getUTCMinutes()) +
      ':' +
      pad(date.getUTCSeconds())

    const insertTweetQuery = `
      INSERT INTO \`posts\`(\`content\`, \`date\`, \`user_id\`) VALUES ('${tweetContent}','${date}','${id}')
      `
    await this.db.executeSQL(insertTweetQuery)
    const selectTweetId = `
      SELECT id FROM posts WHERE content = '${tweetContent}' AND user_id = ${id}
      `
    const postId = await this.db.executeSQL(selectTweetId)
    const userIndex = this.getLoggedInUserById(id)
    const post = new Post(postId[0].id, tweetContent, date, id)
    this.posts.push(post)
    this.twitterUsers[userIndex].postTweet(
      postId[0].id,
      tweetContent,
      date,
      this.twitterUsers[userIndex].getUserId
    )
    return res.status(200).send('OK')
  }

  private editTweet = async (req: Request, res: Response): Promise<void> => {
    const validationRes = validationResult(req)
    if (!validationRes.isEmpty()) {
      return res.status(400).send(validationRes.array()[0].msg)
    }

    const { postId } = matchedData(req)
    const { tweetContent } = matchedData(req)

    const editTweetQuery = `
    UPDATE \`posts\` SET \`content\`='${tweetContent}' WHERE id = ${postId}
    `
    this.db.executeSQL(editTweetQuery)
    return res.sendStatus(200)
  }

  private deleteTweet = async (req: Request, res: Response): Promise<void> => {
    const validationRes = validationResult(req)
    if (!validationRes.isEmpty()) {
      return res.status(400).send(validationRes.array()[0].msg)
    }

    const { postId } = matchedData(req)
    const { id } = req.body

    if (!postId === id)
      return res.status(400).send('Post user does not match Token!')

    const deleteTweetQuery = `
    DELETE FROM \`posts\` WHERE id = ${postId} 
    `
    this.db.executeSQL(deleteTweetQuery)
    return res.sendStatus(200)
  }

  private createComment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const validationRes = validationResult(req)
    if (!validationRes.isEmpty()) {
      return res.status(400).send(validationRes.array()[0].msg)
    }

    const { postId } = matchedData(req)
    const { commentContent } = matchedData(req)
    const { id } = req.body

    // https://stackoverflow.com/questions/20083807/javascript-date-to-sql-date-object
    let pad = function (num) {
      return ('00' + num).slice(-2)
    }
    let date
    date = new Date()
    date =
      date.getUTCFullYear() +
      '-' +
      pad(date.getUTCMonth() + 1) +
      '-' +
      pad(date.getUTCDate()) +
      ' ' +
      pad(date.getUTCHours()) +
      ':' +
      pad(date.getUTCMinutes()) +
      ':' +
      pad(date.getUTCSeconds())

    const createCommentQuery = `
    INSERT INTO \`comments\`(\`content\`, \`date\`,\`user_id\`, \`post_id\`) VALUES ('${commentContent}','${date}','${id}','${postId}')
    `
    await this.db.executeSQL(createCommentQuery)
    const selectCommentId = `
      SELECT id FROM comments WHERE content = '${commentContent}' AND user_id = ${id} AND post_id = ${postId}
      `
    const dbResponse = await this.db.executeSQL(selectCommentId)
    const commentId = dbResponse[0].id
    console.log(this.posts)
    const comment = new TwitterComment(
      commentId,
      commentContent,
      postId,
      date,
      id
    )
    this.twitterUsers[this.getLoggedInUserById(id)].comments?.push(comment)
    this.posts[this.getPostById(Number(postId))].comments?.push(comment)

    return res.sendStatus(200)
  }

  private editComment = async (req: Request, res: Response): Promise<void> => {
    const validationRes = validationResult(req)
    if (!validationRes.isEmpty()) {
      return res.status(400).send(validationRes.array()[0].msg)
    }

    const { commentId } = matchedData(req)
    const { commentContent } = matchedData(req)

    const editTweetQuery = `
    UPDATE \`comments\` SET \`content\`='${commentContent}' WHERE id = ${commentId}
    `
    this.db.executeSQL(editTweetQuery)
    return res.sendStatus(200)
  }

  private deleteComment = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const validationRes = validationResult(req)
    if (!validationRes.isEmpty()) {
      return res.status(400).send(validationRes.array()[0].msg)
    }

    const { commentId } = matchedData(req)

    const deleteCommentQuery = `
    DELETE FROM \`comments\` WHERE id = ${commentId} 
    `
    this.db.executeSQL(deleteCommentQuery)
    return res.sendStatus(200)
  }

  private like = async (req: Request, res: Response): Promise<void> => {
    const validationRes = validationResult(req)
    if (!validationRes.isEmpty()) {
      return res.status(400).send(validationRes.array()[0].msg)
    }
    const { id } = req.body
    const { postId } = matchedData(req)
    const { isPositive } = matchedData(req)

    const likeQuery = `
    INSERT INTO \`likes\`(\`user_id\`, \`post_id\`, \`isPositive\`) VALUES ('${id}','${postId}', '${isPositive}')
    `
    this.db.executeSQL(likeQuery)
    return res.sendStatus(200)
  }

  private getLoggedInUserById(id: number): number {
    for (let i = 0; i < this.twitterUsers.length; i++) {
      const element = this.twitterUsers[i]
      if (element.getUserId === id) return i
    }
    return -1
  }

  private getPostById(id: number): number {
    for (let i = 0; i < this.posts.length; i++) {
      const element = this.posts[i]
      if (element.getPostId === id) return i
    }
    return -1
  }

  private checkUsernameAvailability = async (
    username: string
  ): Promise<boolean> => {
    const checkUsernameQuery = `
      SELECT \`username\` FROM \`users\` WHERE \`username\` = '${username}'
    `
    const usernameAvailable = await this.db.executeSQL(checkUsernameQuery)
    if (usernameAvailable.length === 0) return true
    return false
  }

  private loadObjects = async (): Promise<void> => {
    this.twitterUsers = []
    this.posts = []
    const userQuery = `
    SELECT users.id as 'userId', users.username, 
    users.password FROM users 
    WHERE role_id = 1
    `
    const userResult = await this.db.executeSQL(userQuery)
    if (userResult.length > 0) {
      for (let i = 0; i < userResult.length; i++) {
        const user = userResult[i]
        const userObject = new User(user.userId, user.username, user.password)
        this.twitterUsers.push(userObject)
      }
    }

    const moderatorQuery = `
    SELECT users.id as 'userId', users.username, 
    users.password FROM users 
    WHERE role_id = 3
    `
    const moderatorResult = await this.db.executeSQL(moderatorQuery)
    if (moderatorResult.length > 0) {
      for (let i = 0; i < moderatorResult.length; i++) {
        const user = moderatorResult[i]
        const userObject = new Moderator(
          user.userId,
          user.username,
          user.password
        )
        this.twitterUsers.push(userObject)
      }
    }

    const adminQuery = `
    SELECT users.id as 'userId', users.username, 
    users.password FROM users 
    WHERE role_id = 2
    `
    const adminResult = await this.db.executeSQL(adminQuery)
    if (adminResult.length > 0) {
      for (let i = 0; i < adminResult.length; i++) {
        const user = adminResult[i]
        const userObject = new Admin(user.userId, user.username, user.password)
        this.twitterUsers.push(userObject)
      }
    }

    for (let i = 0; i < this.twitterUsers.length; i++) {
      const element = this.twitterUsers[i]
      const tweetsQuery = `
      SELECT * FROM posts WHERE user_id = ${element.getUserId}
      `
      const tweetsResult = await this.db.executeSQL(tweetsQuery)
      if (tweetsResult.length > 0) {
        for (let i = 0; i < tweetsResult.length; i++) {
          const tweet = tweetsResult[i]
          const postUser = this.getLoggedInUserById(tweet.user_id)
          const postObject = new Post(
            tweet.id,
            tweet.content,
            tweet.date,
            this.twitterUsers[postUser].getUserId
          )
          this.twitterUsers[postUser].loadTweet(postObject)
          this.posts.push(postObject)
        }
      }
    }

    for (let i = 0; i < this.twitterUsers.length; i++) {
      const element = this.twitterUsers[i]
      const commentsQuery = `
      SELECT * FROM comments WHERE user_id = ${element.getUserId}
      `
      const commentsResult = await this.db.executeSQL(commentsQuery)
      //ToDo: SQLResult generic type
      if (commentsResult.length > 0) {
        for (let i = 0; i < commentsResult.length; i++) {
          const comment = commentsResult[i]
          const postUser = this.getLoggedInUserById(comment.user_id)
          const postIndex = this.getPostById(comment.post_id)
          const commentObject = new TwitterComment(
            comment.id,
            comment.content,
            comment.post_id,
            comment.date,
            this.twitterUsers[postUser].getUserId
          )
          this.twitterUsers[postUser].loadComment(commentObject)
          this.posts[postIndex].loadComment(commentObject)
        }
      }
    }

    for (let i = 0; i < this.twitterUsers.length; i++) {
      const element = this.twitterUsers[i]

      const likesQuery = `
      SELECT * FROM likes WHERE user_id = ${element.getUserId}
      `
      const likesResult = await this.db.executeSQL(likesQuery)
      if (likesResult.length > 0) {
        for (let i = 0; i < likesResult.length; i++) {
          const element = likesResult[i]
          const postUser = this.getLoggedInUserById(element.user_id)
          const postIndex = this.getPostById(element.post_id)
          const likeObject = new Like(
            this.twitterUsers[postUser].getUserId,
            element.post_id,
            element.isPositive
          )
          this.twitterUsers[postUser].loadLike(likeObject)
          this.posts[postIndex].loadLike(likeObject)
        }
      }
    }
  }

  private showTweets = async (req: Request, res: Response): Promise<void> => {
    const userPostList = []
    for (let i = 0; i < this.posts.length; i++) {
      const post = this.posts[i]
      const userIndex = this.getLoggedInUserById(post.userId)
      const userPost = { user: this.twitterUsers[userIndex].username, ...post }
      userPostList.push(userPost)
    }
    return res.send(userPostList)
  }

  private showSpecificTweet = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const { id } = req.params
    const postIndex = this.getPostById(Number(id))
    const userIndex = this.getLoggedInUserById(this.posts[postIndex].userId)
    const userPost = {
      user: this.twitterUsers[userIndex].username,
      ...this.posts[postIndex],
    }
    return res.send(userPost)
  }
}

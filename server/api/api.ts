import { Request, Response, Express } from 'express'
import { Database } from '../database'
import bcrypt from 'bcrypt'
import { query, body, validationResult, matchedData } from 'express-validator'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { User } from '../app/user'
import { Post } from '../app/post'
import { JwtMiddleware } from './jwtMiddleware'
dotenv.config()

export class API {
  // Properties
  app: Express
  db: Database
  secretKey = process.env.SECRET_KEY
  twitterUsers: User[]
  posts?: Post[]
  jwtMiddleware = new JwtMiddleware()
  // Constructor
  constructor(app: Express, db: Database) {
    this.twitterUsers = []
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
    this.db = db
  }
  // Methods
  private sayHello(req: Request, res: Response) {
    res.send('Hello There!')
  }

  private register = async (req: Request, res: Response): Promise<any> => {
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

  private login = async (req: Request, res: Response): Promise<any> => {
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
      const loggedInUser = new User(
        userId,
        userInfo[0].username,
        userInfo[0].password
      )
      this.twitterUsers.push(loggedInUser)
      return res
        .status(200)
        .send({ userList: this.twitterUsers, token: jwtToken })
    }

    return res.status(401).send('Username or Password is incorrect!')
  }

  private createTweet = async (req: Request, res: Response): Promise<any> => {
    const validationRes = validationResult(req)
    if (!validationRes.isEmpty()) {
      return res.status(400).send(validationRes.array()[0].msg)
    }

    const { id } = req.body
    const { tweetContent } = matchedData(req)

    const userIndex = this.getLoggedInUserById(id)
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
    this.twitterUsers[userIndex].postTweet(
      tweetContent,
      date,
      this.twitterUsers[userIndex].getUserId
    )
    const newTweet = new Post(
      tweetContent,
      date,
      this.twitterUsers[userIndex].getUserId
    )

    const insertTweetQuery = `
    INSERT INTO \`posts\`(\`content\`, \`date\`, \`user_id\`) VALUES ('${tweetContent}','${date}','${id}')
    `
    this.db.executeSQL(insertTweetQuery)
    return res.status(200).send('OK')
  }

  private editTweet = async (req: Request, res: Response): Promise<any> => {
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

  private deleteTweet = async (req: Request, res: Response): Promise<any> => {
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

  private createComment = async (req: Request, res: Response): Promise<any> => {
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
    this.db.executeSQL(createCommentQuery)
    return res.sendStatus(200)
  }

  private editComment = async (req: Request, res: Response): Promise<any> => {
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

  private deleteComment = async (req: Request, res: Response): Promise<any> => {
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

  private like = async (req: Request, res: Response): Promise<any> => {
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
}

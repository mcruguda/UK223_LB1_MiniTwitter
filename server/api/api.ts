import { Request, Response, Express } from 'express'
import { Database } from '../database'
import bcrypt from 'bcrypt'
import { body, validationResult, matchedData } from 'express-validator'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { User } from '../app/user'
dotenv.config()

export class API {
  // Properties
  app: Express
  db: Database
  secretKey = process.env.SECRET_KEY
  loggedInUsers: User[]
  // Constructor
  constructor(app: Express, db: Database) {
    this.loggedInUsers = []
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
      this.loggedInUsers.push(loggedInUser)
      return res
        .status(200)
        .send({ userList: this.loggedInUsers, token: jwtToken })
    }

    return res.status(401).send('Username or Password is incorrect!')
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

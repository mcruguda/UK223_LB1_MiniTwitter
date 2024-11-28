import { Request, Response, Express } from 'express'
import { Database } from '../database'
import bcrypt from 'bcrypt'

export class API {
  // Properties
  app: Express
  db: Database
  // Constructor
  constructor(app: Express, db: Database) {
    this.app = app
    this.app.get('/hello', this.sayHello)
    this.app.post('/register', this.register)
    this.db = db
  }
  // Methods
  private sayHello(req: Request, res: Response) {
    res.send('Hello There!')
  }

  private register = async (req: Request, res: Response): Promise<any> => {
    const { username, password, role } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const insertUser = `
    INSERT INTO \`users\`(\`username\`, \`password\`, \`role_id\`) VALUES ('${username}','${hashedPassword}',(SELECT \`id\` FROM \`roles\` WHERE \`name\` = '${role}')); 
    `
    this.db.executeSQL(insertUser)
    return res.sendStatus(200)
  }

  private login = async (req: Request, res: Response): Promise<any> => {
    const { username, password } = req.body
  }
}

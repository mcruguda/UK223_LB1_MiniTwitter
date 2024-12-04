import mysql from 'mysql2/promise'
import {
  USER_TABLE,
  TWEET_TABLE,
  COMMENT_TABLE,
  ROLE_TABLE,
  LIKE_TABLE,
  CREATE_ROLES,
} from './schema'

export class Database {
  // Properties
  private _pool: mysql.Pool

  // Constructor
  constructor() {
    this._pool = mysql.createPool({
      port: 3306,
      database: process.env.DB_NAME || 'minitwitter',
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'minitwitter',
      password: process.env.DB_PASSWORD || 'supersecret123',
      connectionLimit: 5,
    })
    this.initializeDBSchema()
  }

  // Methods
  private initializeDBSchema = async () => {
    console.log('Initializing DB schema...')
    await this.executeSQL(ROLE_TABLE)
    await this.executeSQL(USER_TABLE)
    await this.executeSQL(TWEET_TABLE)
    await this.executeSQL(COMMENT_TABLE)
    await this.executeSQL(LIKE_TABLE)
    //await this.executeSQL(CREATE_ROLES)
  }

  public executeSQL = async (query: string) => {
    try {
      const conn = await this._pool.getConnection()
      try {
        const [results] = await conn.query(query)
        return results
      } finally {
        conn.release() // Use `release` instead of `end` to keep the connection in the pool
      }
    } catch (err) {
      console.error('Error executing query:', err)
    }
  }
}

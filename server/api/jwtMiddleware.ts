import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
dotenv.config()
const secretKey = process.env.SECRET_KEY

export class JwtMiddleware {
  constructor() {}

  verifyToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Failed to authenticate token' })
      }

      req.body.id = decoded.data.userId
      next()
    })
  }
}

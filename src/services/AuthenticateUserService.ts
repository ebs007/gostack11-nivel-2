import { getRepository } from 'typeorm'
import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import authConfig from '../config/auth'

import User from '../models/User'

interface Request {
  email: string
  password: string
}

interface Response {
  user: User
  token: string
}

class AuthenticateUserService {
  public async execute({ email, password }: Request): Promise<Response> {
    const usersRepository = getRepository(User)

    const user = await usersRepository.findOne({ where: { email } })

    if (!user) {
      throw new Error('Incorret email/password combination')
    }

    const passwordMatched = await compare(password, user.password)

    if (!passwordMatched) {
      throw new Error('Incorrect email/password combination')
    }

    const { secret, expireIn } = authConfig.jwt

    const token = sign({}, secret, {
      subject: user.id,
      expiresIn: expireIn,
    })

    return {
      user,
      token,
    }
  }
}

export default AuthenticateUserService

import { NextFunction, Request, Response, Router } from 'express';
import IUserModel, { User } from '../database/models/user.model';

const router: Router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Authorization]
 *     description: Регистрация аккаунта. При удачной регистрации происходит автоматическая авторизация.
 *     requestBody: 
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserRegister'
 *     responses:
 *      '200':
 *        description: Удачное завершение регистрации. Авторизация пользователя, получение JWT.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserResponse'
 *      '422':
 *        description: Ошибка заполнения формы
 */
router.post('/register', (req: Request, res: Response, next: NextFunction) => {

  const user: IUserModel = new User();

  const { username, email, password } = req.body

  if (!username && typeof username !== "string") {
    return res.status(422).json({ errors: { username: "Incorrect input" } });
  }

  if (!email && typeof email !== "string") {
    return res.status(422).json({ errors: { email: "Incorrect input" } });
  }

  if (!password && typeof password !== "string") {
    return res.status(422).json({ errors: { password: "Incorrect input" } });
  }

  user.username = req.body.username;
  user.email = req.body.email;
  user.setPassword(req.body.password);

  return user.save()
    .then(() => {
      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);

});

/**
 * @swagger
 * /api/auth/login:
 *  post:
 *    summary: Авторизация пользователя
 *    tags: [Authorization]
 *    description: Авторизация пользователя. При удачном входе выдается JWT для дальнейшей аутентификации.
 *    requestBody: 
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserLogin'
 *    responses:
 *      '200':
 *        description: Авторизация пользователя, получение JWT.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserResponse'
 *      '401':
 *        description: Ошибка авторизации
 *      '422':
 *        description: Ошибка заполнения формы
 */
router.post('/login', (req: Request, res: Response, next: NextFunction) => {

  const { email, password } = req.body

  if (!email && typeof email !== "string") {
    return res.status(422).json({ errors: { email: "Incorrect input" } });
  }

  if (!password && typeof password !== "string") {
    return res.status(422).json({ errors: { password: "Incorrect input" } });
  }

  User
    .findOne({ email: req.body.email })
    .then((user: IUserModel) => {
      if (user && user.validPassword(req.body.password)) {
        user.token = user.generateJWT();
        return res.json({ user: user.toAuthJSON() });
      } else {
        return res.status(401).json({ errors: { message: "Invalid username or password" } });
      }

    })
    .catch(next)

});


export const UsersRoutes: Router = router;

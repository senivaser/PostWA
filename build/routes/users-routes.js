"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRoutes = void 0;
const express_1 = require("express");
const user_model_1 = require("../database/models/user.model");
const router = express_1.Router();
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
router.post('/register', (req, res, next) => {
    const user = new user_model_1.User();
    const { username, email, password } = req.body;
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
router.post('/login', (req, res, next) => {
    const { email, password } = req.body;
    if (!email && typeof email !== "string") {
        return res.status(422).json({ errors: { email: "Incorrect input" } });
    }
    if (!password && typeof password !== "string") {
        return res.status(422).json({ errors: { password: "Incorrect input" } });
    }
    user_model_1.User
        .findOne({ email: req.body.email })
        .then((user) => {
        if (user && user.validPassword(req.body.password)) {
            user.token = user.generateJWT();
            return res.json({ user: user.toAuthJSON() });
        }
        else {
            return res.status(401).json({ errors: { message: "Invalid username or password" } });
        }
    })
        .catch(next);
});
exports.UsersRoutes = router;
//# sourceMappingURL=users-routes.js.map
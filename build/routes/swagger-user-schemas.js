/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegister:
 *       type: object
 *       required: true
 *       properties:
 *         username:
 *           type: string
 *           description: Имя пользователя (цифры и буквы)
 *         email:
 *           type: string
 *           description: E-mail пользователя
 *         password:
 *           type: string
 *           description: Пароль для учетной записи
 *       example:
 *         username: senivaser
 *         email: senivaser@gmail.com
 *         password: "12345"
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UserLogin:
 *       type: object
 *       required: true
 *       properties:
 *         email:
 *           type: string
 *           description: E-mail пользователя
 *         password:
 *           type: string
 *           description: Пароль для учетной записи
 *       example:
 *         email: senivaser@gmail.com
 *         password: "12345"
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *        user:
 *         type: object
 *         properties:
 *          username:
 *           type: string
 *           description: Имя пользователя (цифры и буквы)
 *          email:
 *           type: string
 *           description: E-mail пользователя
 *          token:
 *           type: string
 *           description: JWT Token для авторизации
 *       example:
 *         user:
 *          username: senivaser
 *          email: senivaser@gmail.com
 *          token: Bearer JWT
 */
//# sourceMappingURL=swagger-user-schemas.js.map
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleNew:
 *      type: object
 *      properties:
 *       text:
 *        type: string
 *        required: true
 *        description: Текст заметки
 *       media:
 *        type: file
 *        format: binary
 *        description: Прикрепленный файл. Файлы можно прикреплять до 10 раз по этому полю.
 *      encoding:
 *        media:
 *          contentType: image/png, image/jpeg
 *      example:
 *       text: "Hello there!"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleTextUpdate:
 *      type: object
 *      properties:
 *       text:
 *        type: string
 *        required: true
 *        description: Прикрепленный файл
 *      example:
 *       text: "Here we go!"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleMediaUpdate:
 *      type: object
 *      properties:
 *       media:
 *        type: string
 *        format: binary
 *        required: true
 *        description: Измененный текст заметки
 *      encoding:
 *        media:
 *          contentType: image/png, image/jpeg
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleMediaUpdate:
 *      properties:
 *       media:
 *        type: file
 *        format: binary
 *        description: Прикрепленный файл. Больше одного файла прикрепить нельзя
 *      example:
 *       text: "Here we go!"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleResponse:
 *      properties:
 *       article:
 *        type: object
 *        required: true
 *        properties:
 *          uuid:
 *            type: string
 *            description: Идентификатор записи
 *          text:
 *            type: string
 *            description: Текст записи
 *          createdAt:
 *            type: string
 *            description: Дата создания
 *          updatedAt:
 *            type: string
 *            description: Дата последнего изменения
 *          media:

 *            type: array
 *            items:
 *              type: string
 *              description: Список файлов прикрепленных к записи
 *          author:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                description: Никнейм автора записи
 *      example:
 *        article:
 *          "uuid": "1c341e9a-4fd6-41ef-9c03-9051c3e68775"
 *          "text": "Это мой первый пост!!"
 *          "createdAt": "2021-10-22T07:14:32.555Z"
 *          "updatedAt": "2021-10-22T07:14:32.555Z"
 *          "media": [ "1634886872287-0.5.png",
 *            "1634886872309-123.png",
 *            "1634886872503-ez2ivnz.png",
 *            "1634889264716-zachetka.jpg" ]
 *          "author":
 *            "username": "senivaser"
 *
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleResponseFeed:
 *      properties:
 *       articles:
 *        type: array
 *        required: true
 *        items:
 *          type: object
 *          properties:
 *            uuid:
 *              type: string
 *              description: Идентификатор записи
 *            text:
 *              type: string
 *              description: Текст записи
 *            createdAt:
 *              type: string
 *              description: Дата создания
 *            updatedAt:
 *              type: string
 *              description: Дата последнего изменения
 *            media:
 *              type: array
 *              items:
 *                type: string
 *                description: Список файлов прикрепленных к записи
 *            author:
 *             type: string
 *             description: Никнейм автора записи
 *      example:
 *        articles:
 *          - { "uuid": "1c341e9a-4fd6-41ef-9c03-9051c3e68775",
 *            "text": "Это мой первый пост!!",
 *            "createdAt": "2021-10-22T07:14:32.555Z",
 *            "updatedAt": "2021-10-22T07:14:32.555Z",
 *            "media": [ "1634886872287-0.5.png",
 *              "1634886872309-123.png",
 *              "1634886872503-ez2ivnz.png",
 *              "1634889264716-zachetka.jpg" ],
 *            "author": "senivaser" }
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleActionResponse:
 *      properties:
 *       uuid:
 *        type: string
 *        description: Идентификатор заметки
 *       message:
 *        type: string
 *        description: Сообщение о событии.
 *      example:
 *       uuid: "1c341e9a-4fd6-41ef-9c03-9051c3e68775"
 *       media: "Somtething Succeed"
 */

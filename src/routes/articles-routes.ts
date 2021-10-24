import { Request, Response, Router } from 'express';
import { authentication } from '../utilities/authentication';
import IUserModel, { User } from '../database/models/user.model';
import IArticleModel, { Article } from "../database/models/article.model";
import fs from 'fs'
import { dest, upload } from '../utilities/fileUploading'

const router: Router = Router();
/**
 * @swagger
 * /api/article/new:
 *   post:
 *     summary: Создание новой заметки
 *     security:
 *       - bearerAuth: [] 
 *     tags: [Article]
 *     description: Создает информацию о новой заметке в базе данных. 
 *      Может содержать в теле запроса текс заметки, либо приложенные к заметке медиа-файлы. Можно до 10 раз использовать параметр media, для добавления файлов.
 *      
 *      Требуется авторизация
 *     requestBody: 
 *       required: true
 *       content: 
 *        multipart/form-data:
 *          schema:
 *            $ref: '#/components/schemas/ArticleNew'
 *     responses:
 *      '200':
 *        description: Удачная публикация заметки. Ответ содержит информацию об опубликованной заметке.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ArticleResponse'
 *      '401':
 *        description: Ошибка аутентификации
 *      '422':
 *        description: Ошибка заполнения формы
 *      '500':
 *        descpription: Внутренняя ошибка сервера
 */
router.post('/new', upload.array('media', 10), authentication.required, (req: Request, res: Response, next) => {


  const text: string = req.body.text;
  const filenames: string[] = (req.files as Express.Multer.File[]).map((file: Express.Multer.File) => file.filename)

  if (!text) {
    return res.status(422).send({ errors: { text: "Can't be blank" } });
  }

  User
    .findById(req.payload.id)
    .then((user: IUserModel) => {
      if (!user) {
        return res.status(401).send({ errors: { message: "Authentication error" } });
      }
      const article: IArticleModel = new Article();

      article.text = text;
      article.author = user;
      article.media = filenames;

      return article.save()
        .then(() => {
          return res.json({ article: article.toJSONFor() })
        })
    })
    .catch(next)
})

/**
 * @swagger
 * /api/article/feed:
 *   get:
 *     summary: Отображение информации обо всех текущих заметках
 *     tags: [Article]
 *     description: Выводит все текущие заметки с пагинацией (20 заметок на странице)
 *      Параметр page в запросе определяет номер страницы
 *     parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        description: Номер страницы
 *     responses:
 *      '200':
 *        description: Запрос успешен
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ArticleResponseFeed'
 *      '401':
 *        description: Ошибка аутентификации
 *      '500':
 *        descpription: Внутренняя ошибка сервера
 */
router.get('/feed', authentication.optional, (req: Request, res: Response, next) => {
  let page: number = 1
  const queryPage: any = req.query.page || null
  if (queryPage && parseInt(queryPage)) {
    page = parseInt(queryPage)
  }
  Article
    .find()
    .limit(20)
    .skip(20 * (page - 1))
    .populate('author')
    .then((articles: IArticleModel[]) => {
      return res.json({ articles: articles.map(article => article.toJSONFor()) })
    })
    .catch(next)
})

/**
 * @swagger
 * /api/article/id/{uuid}:
 *   get:
 *     summary: Информация о данной заметке
 *     tags: [Article]
 *     description: Адрес запроса содержит uuid заметки. 
 *        Ответ на запрос содержит полную информацию о заметке, включая список файлов
 *     parameters:
 *      - in: path
 *        name: uuid
 *        schema:
 *          type: string
 *        description: Идентификатор заметки
 *     responses:
 *      '200':
 *        description: Заметка найдена. Ответ содержит информацию об искомой заметке.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ArticleResponse'
 *      '401':
 *        description: Ошибка аутентификации
 *      '500':
 *        descpription: Внутренняя ошибка сервера
 */
router.get('/id/:uuid', authentication.optional, (req: Request, res: Response, next) => {
  Article
    .findOne({ uuid: req.params.uuid })
    .populate('author')
    .then((article: IArticleModel) => {
      if (!article) {
        return res.status(401).send({ errors: { message: "Wrong Article UUID" } });
      }

      return res.json({ article: article.toJSONFor() })
    })
    .catch(next)
})

/**
 * @swagger
 * /api/article/id/{uuid}:
 *   delete:
 *     summary: Удаляет указанную заметку
 *     security:
 *       - bearerAuth: [] 
 *     tags: [Article]
 *     description: Адрес запроса содержит uuid заметки, которую необходимо удалить. 
 *        Ответ на запрос содержит сообщение о статусе удаления.
 *     parameters:
 *      - in: path
 *        name: uuid
 *        schema:
 *          type: string
 *        description: Идентификатор заметки
 *     responses:
 *      '200':
 *        description: Заметка удалена успешно. Тело ответа на запрос содержит сообщение об удачном удалении.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ArticleActionResponse'
 *      '401':
 *        description: Ошибка аутентификации
 *      '403':
 *        description: Недостаточно прав для выполнения операции
 *      '500':
 *        descpription: Внутренняя ошибка сервера
 */
router.delete('/id/:uuid', authentication.required, (req: Request, res: Response, next) => {

  User
    .findById(req.payload.id)
    .then((user: IUserModel) => {
      if (!user) {
        return res.status(401).send({ errors: { message: "Authentication error" } });
      }
      Article
        .findOne({ uuid: req.params.uuid })
        .then((article: IArticleModel) => {
          if (`${article.author}` !== `${user._id}`) {
            return res.status(403).send({ errors: { message: "Insufficient rights for this operation" } });
          }
          const media = [...article.media]
          media.forEach((filename: string) => fs.unlinkSync(`${dest}/${filename}`))
          article.remove();
          return res.json({ uuid: req.params.uuid, message: "Deletition Succeed" })
        })
    })
    .catch(next)


})


/**
 * @swagger
 * /api/article/id/{uuid}/text:
 *   post:
 *     summary: Изменение текста заметки
 *     security:
 *       - bearerAuth: [] 
 *     tags: [Article]
 *     description: Изменяет текст в данной заметке на переданный в теле запроса
 *        Ответ на запрос содержит сообщение о статусе изменения текста.
 *     parameters:
 *      - in: path
 *        name: uuid
 *        schema:
 *          type: string
 *        description: Идентификатор заметки
 *     requestBody: 
 *       required: true
 *       content: 
 *        multipart/form-data:
 *          schema:
 *            $ref: '#/components/schemas/ArticleTextUpdate'         
 *     responses:
 *      '200':
 *        description: Текст заметки успешно изменен. Тело ответа на запрос содержит сообщение об удачном удалении.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ArticleActionResponse'
 *      '401':
 *        description: Ошибка аутентификации
 *      '403':
 *        description: Недостаточно прав для выполнения операции
 *      '500':
 *        descpription: Внутренняя ошибка сервера
 */
router.post('/id/:uuid/text', upload.none(), authentication.required, (req: Request, res: Response, next) => {
  const text: string = req.body.text
  console.log(req.body)
  if (!text || !text.length) {
    res.status(401).send({ errors: { text: "Can't be blank" } })
  }
  User
    .findById(req.payload.id)
    .then((user: IUserModel) => {
      if (!user) {
        return res.status(401).send({ errors: { message: "Authentication error" } });
      }
      Article
        .findOne({ uuid: req.params.uuid })
        .then((article: IArticleModel) => {
          if (`${article.author}` !== `${user._id}`) {
            return res.status(403).send({ errors: { message: "Insufficient rights for this operation" } });
          }
          if (!article) {
            return res.status(404).send({ errors: { message: "Article is not found" } });
          }

          article.text = req.body.text;
          article.save();
          return res.json({ uuid: req.params.uuid, message: "Text has been successfully changed" })
        })
        .catch(next)
    })
    .catch(next)
})


/**
 * @swagger
 * /api/article/id/{uuid}/media:
 *   post:
 *     summary: Прикрепление медиа файла
 *     security:
 *       - bearerAuth: [] 
 *     tags: [Article]
 *     description: Прикрепляет медиа файл из формы к заметке в базе данных, а так же дает к нему доступ в хранилище по имени файла.
 *        Ответ на запрос содержит сообщение о статусе выполнения операции прикрепления.
 * 
 *        Предполагается, что медиа файлы будут прикрепляться в интерактивном окне через "+"
 *     parameters:
 *      - in: path
 *        name: uuid
 *        schema:
 *          type: string
 *        description: Идентификатор заметки
 *     requestBody: 
 *       required: true
 *       content: 
 *        multipart/form-data:
 *          schema:
 *            $ref: '#/components/schemas/ArticleMediaUpdate'         
 *     responses:
 *      '200':
 *        description: Текст заметки успешно изменен. Тело ответа на запрос содержит сообщение об удачном удалении.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ArticleActionResponse'
 *      '401':
 *        description: Ошибка аутентификации
 *      '403':
 *        description: Недостаточно прав для выполнения операции
 *      '500':
 *        descpription: Внутренняя ошибка сервера
 */
router.post('/id/:uuid/media', authentication.required, upload.single('media'), (req: Request, res: Response, next) => {

  const filename = req.file.filename

  User
    .findById(req.payload.id)
    .then((user: IUserModel) => {
      if (!user) {
        return res.status(401).send({ errors: { message: "Authentication error" } });
      }
      Article
        .findOne({ uuid: req.params.uuid })
        .then((article: IArticleModel) => {
          if (!article) {
            return res.status(404).send({ errors: { message: "Article is not found" } });
          }

          const result = article.attachMedia(filename)
          article.save();
          return res.json({ uuid: req.params.uuid, filename: filename, message: result })
        })
        .catch(next)
    })
    .catch(next)
})

/**
 * @swagger
 * /api/article/id/{uuid}/media/{filename}:
 *   delete:
 *     summary: Удаление медиа файла
 *     security:
 *       - bearerAuth: [] 
 *     tags: [Article]
 *     description: Открепляет медиа файл от заметки в базе данных, а так же удаляет из хранилища
 *        Ответ на запрос содержит сообщение о статусе выполнения операции прикрепления.
 * 
 *        Предполагается, что медиа файлы будут удаляться в интерактивном окне через "х"
 *     parameters:
 *      - in: path
 *        name: uuid
 *        schema:
 *          type: string
 *        description: Идентификатор заметки
 *      - in: path
 *        name: filename
 *        schema:
 *          type: string
 *        description: Название удаляемого файла  
 *     responses:
 *      '200':
 *        description: Текст заметки успешно изменен. Тело ответа на запрос содержит сообщение об удачном удалении.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ArticleActionResponse'
 *      '401':
 *        description: Ошибка аутентификации
 *      '403':
 *        description: Недостаточно прав для выполнения операции
 *      '500':
 *        descpription: Внутренняя ошибка сервера
 */
router.delete('/id/:uuid/media/:filename', authentication.required, (req: Request, res: Response, next) => {
  const filename = req.params.filename

  User
    .findById(req.payload.id)
    .then((user: IUserModel) => {
      if (!user) {
        return res.status(401).send({ errors: { message: "Authentication error" } });
      }
      Article
        .findOne({ uuid: req.params.uuid })
        .then((article: IArticleModel) => {
          if (!article) {
            return res.status(404).send({ errors: { message: "Article is not found" } });
          }

          const result = article.deleteMedia(filename);
          if (result.message === "Media deletition succeed") {
            fs.unlink(`${dest}/${filename}`, (err: NodeJS.ErrnoException) => {
              if (err) {
                return res.status(500).json({ uuid: req.params.uuid, filename: filename, message: "Media deletition Internal Error" })
              } else {
                article.save();
                return res.json({ uuid: req.params.uuid, filename: filename, message: result })
              }
            })
          } else {
            return res.status(404).json({ uuid: req.params.uuid, filename: filename, message: result })
          }

        })
        .catch(next)
    })
    .catch(next)
})

export const ArticlesRoutes: Router = router;

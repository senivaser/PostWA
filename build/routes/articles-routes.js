"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesRoutes = void 0;
const express_1 = require("express");
const authentication_1 = require("../utilities/authentication");
const user_model_1 = require("../database/models/user.model");
const article_model_1 = require("../database/models/article.model");
const fs_1 = __importDefault(require("fs"));
const fileUploading_1 = require("../utilities/fileUploading");
const router = express_1.Router();
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
 */
router.post('/new', fileUploading_1.upload.array('media', 10), authentication_1.authentication.required, (req, res, next) => {
    const text = req.body.text;
    const filenames = req.files.map((file) => file.filename);
    if (!text) {
        return res.status(422).send({ errors: { text: "Can't be blank" } });
    }
    user_model_1.User
        .findById(req.payload.id)
        .then((user) => {
        if (!user) {
            return res.status(401).send({ errors: { message: "Authentication error" } });
        }
        const article = new article_model_1.Article();
        article.text = text;
        article.author = user;
        article.media = filenames;
        return article.save()
            .then(() => {
            return res.json({ article: article.toJSONFor() });
        });
    })
        .catch(next);
});
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
 */
router.get('/feed', authentication_1.authentication.optional, (req, res, next) => {
    let page = 1;
    const queryPage = req.query.page || null;
    if (queryPage && parseInt(queryPage)) {
        page = parseInt(queryPage);
    }
    article_model_1.Article
        .find()
        .limit(20)
        .skip(20 * (page - 1))
        .populate('author')
        .then((articles) => {
        return res.json({ articles: articles.map(article => article.toJSONFor()) });
    })
        .catch(next);
});
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
 */
router.get('/id/:uuid', authentication_1.authentication.optional, (req, res, next) => {
    article_model_1.Article
        .findOne({ uuid: req.params.uuid })
        .populate('author')
        .then((article) => {
        if (!article) {
            return res.status(401).send({ errors: { message: "Wrong Article UUID" } });
        }
        return res.json({ article: article.toJSONFor() });
    })
        .catch(next);
});
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
 */
router.delete('/id/:uuid', authentication_1.authentication.required, (req, res, next) => {
    user_model_1.User
        .findById(req.payload.id)
        .then((user) => {
        if (!user) {
            return res.status(401).send({ errors: { message: "Authentication error" } });
        }
        article_model_1.Article
            .findOne({ uuid: req.params.uuid })
            .then((article) => {
            if (`${article.author}` !== `${user._id}`) {
                return res.status(403).send({ errors: { message: "Insufficient rights for this operation" } });
            }
            const media = [...article.media];
            media.forEach((filename) => fs_1.default.unlinkSync(`${fileUploading_1.dest}/${filename}`));
            article.remove();
            return res.json({ uuid: req.params.uuid, message: "Deletition Succeed" });
        });
    })
        .catch(next);
});
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
 */
router.post('/id/:uuid/text', fileUploading_1.upload.none(), authentication_1.authentication.required, (req, res, next) => {
    const text = req.body.text;
    console.log(req.body);
    if (!text || !text.length) {
        res.status(401).send({ errors: { text: "Can't be blank" } });
    }
    user_model_1.User
        .findById(req.payload.id)
        .then((user) => {
        if (!user) {
            return res.status(401).send({ errors: { message: "Authentication error" } });
        }
        article_model_1.Article
            .findOne({ uuid: req.params.uuid })
            .then((article) => {
            if (`${article.author}` !== `${user._id}`) {
                return res.status(403).send({ errors: { message: "Insufficient rights for this operation" } });
            }
            if (!article) {
                return res.status(404).send({ errors: { message: "Article is not found" } });
            }
            article.text = req.body.text;
            article.save();
            return res.json({ uuid: req.params.uuid, message: "Text has been successfully changed" });
        })
            .catch(next);
    })
        .catch(next);
});
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
 */
router.post('/id/:uuid/media', authentication_1.authentication.required, fileUploading_1.upload.single('media'), (req, res, next) => {
    const filename = req.file.filename;
    user_model_1.User
        .findById(req.payload.id)
        .then((user) => {
        if (!user) {
            return res.status(401).send({ errors: { message: "Authentication error" } });
        }
        article_model_1.Article
            .findOne({ uuid: req.params.uuid })
            .then((article) => {
            if (!article) {
                return res.status(404).send({ errors: { message: "Article is not found" } });
            }
            const result = article.attachMedia(filename);
            article.save();
            return res.json({ uuid: req.params.uuid, filename: filename, message: result });
        })
            .catch(next);
    })
        .catch(next);
});
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
 */
router.delete('/id/:uuid/media/:filename', authentication_1.authentication.required, (req, res, next) => {
    const filename = req.params.filename;
    user_model_1.User
        .findById(req.payload.id)
        .then((user) => {
        if (!user) {
            return res.status(401).send({ errors: { message: "Authentication error" } });
        }
        article_model_1.Article
            .findOne({ uuid: req.params.uuid })
            .then((article) => {
            if (!article) {
                return res.status(404).send({ errors: { message: "Article is not found" } });
            }
            const result = article.deleteMedia(filename);
            if (result.message === "Media deletition succeed") {
                fs_1.default.unlink(`${fileUploading_1.dest}/${filename}`, (err) => {
                    if (err) {
                        return res.status(500).json({ uuid: req.params.uuid, filename: filename, message: "Media deletition Internal Error" });
                    }
                    else {
                        article.save();
                        return res.json({ uuid: req.params.uuid, filename: filename, message: result });
                    }
                });
            }
            else {
                return res.status(404).json({ uuid: req.params.uuid, filename: filename, message: result });
            }
        })
            .catch(next);
    })
        .catch(next);
});
exports.ArticlesRoutes = router;
//# sourceMappingURL=articles-routes.js.map
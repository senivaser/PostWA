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
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const dest = './uploads';
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer_1.default({ storage: storage });
const router = express_1.Router();
router.post('/new', upload.array('media', 10), authentication_1.authentication.required, (req, res, next) => {
    const text = req.body.text;
    const filenames = req.files.map((file) => file.filename);
    if (!text) {
        return res.status(401).send({ errors: { message: "Can't be blank" } });
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
router.get('/:auid', authentication_1.authentication.optional, (req, res, next) => {
    article_model_1.Article
        .findOne({ uuid: req.params.auid })
        .populate('author')
        .then((article) => {
        if (!article) {
            return res.status(401).send({ errors: { message: "Wrong Article UUID" } });
        }
        return res.json({ article: article.toJSONFor() });
    })
        .catch(next);
});
router.delete('/:auid', authentication_1.authentication.required, (req, res, next) => {
    user_model_1.User
        .findById(req.payload.id)
        .then((user) => {
        if (!user) {
            return res.status(401).send({ errors: { message: "Authentication error" } });
        }
        article_model_1.Article
            .deleteOne({ uuid: req.params.auid })
            .then(() => {
            return res.json({ auid: req.params.auid, message: "Deletition Succeed" });
        })
            .catch(next);
    })
        .catch(next);
});
router.post('/:auid/text', authentication_1.authentication.required, (req, res, next) => {
    const text = req.body.text;
    if (!text.length) {
        res.status(401).send({ errors: { text: "Can't be blank" } });
    }
    user_model_1.User
        .findById(req.payload.id)
        .then((user) => {
        if (!user) {
            return res.status(401).send({ errors: { message: "Authentication error" } });
        }
        article_model_1.Article
            .findOne({ uuid: req.params.auid })
            .then((article) => {
            if (!article) {
                return res.status(404).send({ errors: { message: "Article is not found" } });
            }
            article.text = req.body.text;
            return res.json({ auid: req.params.auid, message: "Deletition Succeed" });
        })
            .catch(next);
    })
        .catch(next);
});
router.post('/:auid/media', authentication_1.authentication.required, upload.single('media'), (req, res, next) => {
    const filename = req.file.filename;
    user_model_1.User
        .findById(req.payload.id)
        .then((user) => {
        if (!user) {
            return res.status(401).send({ errors: { message: "Authentication error" } });
        }
        article_model_1.Article
            .findOne({ uuid: req.params.auid })
            .then((article) => {
            if (!article) {
                return res.status(404).send({ errors: { message: "Article is not found" } });
            }
            const result = article.attachMedia(filename);
            article.save();
            return res.json({ auid: req.params.auid, filename: filename, message: result });
        })
            .catch(next);
    })
        .catch(next);
});
router.delete('/:auid/media/:filename', authentication_1.authentication.required, (req, res, next) => {
    const filename = req.params.filename;
    user_model_1.User
        .findById(req.payload.id)
        .then((user) => {
        if (!user) {
            return res.status(401).send({ errors: { message: "Authentication error" } });
        }
        article_model_1.Article
            .findOne({ uuid: req.params.auid })
            .then((article) => {
            if (!article) {
                return res.status(404).send({ errors: { message: "Article is not found" } });
            }
            const result = article.deleteMedia(filename);
            if (result.message === "Media deletition succeed") {
                fs_1.default.unlink(`${dest}/${filename}`, (err) => {
                    if (err) {
                        return res.status(500).json({ auid: req.params.auid, filename: filename, message: "Media deletition Internal Error" });
                    }
                    else {
                        article.save();
                        return res.json({ auid: req.params.auid, filename: filename, message: result });
                    }
                });
            }
            else {
                return res.status(404).json({ auid: req.params.auid, filename: filename, message: result });
            }
        })
            .catch(next);
    })
        .catch(next);
});
exports.ArticlesRoutes = router;
//# sourceMappingURL=articles-routes.js.map
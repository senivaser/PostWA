import { Request, Response, Router } from 'express';
import { authentication } from '../utilities/authentication';
import IUserModel, { User } from '../database/models/user.model';
import IArticleModel, { Article } from "../database/models/article.model";
import multer from 'multer';
import fs from 'fs'

const dest = './uploads'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dest)
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({ storage: storage })

const router: Router = Router();

router.post('/new', upload.array('media', 10), authentication.required, (req: Request, res: Response, next) => {


  const text: string = req.body.text;
  const filenames: string[] = (req.files as Express.Multer.File[]).map((file: Express.Multer.File) => file.filename)

  if (!text) {
    return res.status(401).send({ errors: { message: "Can't be blank" } });
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

router.get('/:auid', authentication.optional, (req: Request, res: Response, next) => {
  Article
    .findOne({ uuid: req.params.auid })
    .populate('author')
    .then((article: IArticleModel) => {
      if (!article) {
        return res.status(401).send({ errors: { message: "Wrong Article UUID" } });
      }

      return res.json({ article: article.toJSONFor() })
    })
    .catch(next)
})

router.delete('/:auid', authentication.required, (req: Request, res: Response, next) => {

  User
    .findById(req.payload.id)
    .then((user: IUserModel) => {
      if (!user) {
        return res.status(401).send({ errors: { message: "Authentication error" } });
      }
      Article
        .deleteOne({ uuid: req.params.auid })
        .then(() => {
          return res.json({ auid: req.params.auid, message: "Deletition Succeed" })
        })
        .catch(next)
    })
    .catch(next)


})

router.post('/:auid/text', authentication.required, (req: Request, res: Response, next) => {
  const text: string = req.body.text
  if (!text.length) {
    res.status(401).send({ errors: { text: "Can't be blank" } })
  }
  User
    .findById(req.payload.id)
    .then((user: IUserModel) => {
      if (!user) {
        return res.status(401).send({ errors: { message: "Authentication error" } });
      }
      Article
        .findOne({ uuid: req.params.auid })
        .then((article: IArticleModel) => {
          if (!article) {
            return res.status(404).send({ errors: { message: "Article is not found" } });
          }

          article.text = req.body.text;
          return res.json({ auid: req.params.auid, message: "Deletition Succeed" })
        })
        .catch(next)
    })
    .catch(next)
})

router.post('/:auid/media', authentication.required, upload.single('media'), (req: Request, res: Response, next) => {

  const filename = req.file.filename

  User
    .findById(req.payload.id)
    .then((user: IUserModel) => {
      if (!user) {
        return res.status(401).send({ errors: { message: "Authentication error" } });
      }
      Article
        .findOne({ uuid: req.params.auid })
        .then((article: IArticleModel) => {
          if (!article) {
            return res.status(404).send({ errors: { message: "Article is not found" } });
          }

          const result = article.attachMedia(filename)
          article.save();
          return res.json({ auid: req.params.auid, filename: filename, message: result })
        })
        .catch(next)
    })
    .catch(next)
})

router.delete('/:auid/media/:filename', authentication.required, (req: Request, res: Response, next) => {
  const filename = req.params.filename

  User
    .findById(req.payload.id)
    .then((user: IUserModel) => {
      if (!user) {
        return res.status(401).send({ errors: { message: "Authentication error" } });
      }
      Article
        .findOne({ uuid: req.params.auid })
        .then((article: IArticleModel) => {
          if (!article) {
            return res.status(404).send({ errors: { message: "Article is not found" } });
          }

          const result = article.deleteMedia(filename);
          if (result.message === "Media deletition succeed") {
            fs.unlink(`${dest}/${filename}`, (err: NodeJS.ErrnoException) => {
              if (err) {
                return res.status(500).json({ auid: req.params.auid, filename: filename, message: "Media deletition Internal Error" })
              } else {
                article.save();
                return res.json({ auid: req.params.auid, filename: filename, message: result })
              }
            })
          } else {
            return res.status(404).json({ auid: req.params.auid, filename: filename, message: result })
          }

        })
        .catch(next)
    })
    .catch(next)
})

export const ArticlesRoutes: Router = router;

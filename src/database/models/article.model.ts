import { Document, Model, model, Schema } from 'mongoose';
import { IArticle } from '../../interfaces/article-interface';
import uuid from 'uuid';

export default interface IArticleModel extends IArticle, Document {
  toJSONFor(): any;

  attachMedia(filename: string): any;

  deleteMedia(filename: string): any;

}

const ArticleSchema = new Schema<any>({
  uuid: {
    type: Schema.Types.String,
    unique: true
  },
  text: {
    type: Schema.Types.String
  },
  media: [{
    type: Schema.Types.String
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
}, {
  timestamps: true
});

ArticleSchema.pre('save', function (next: any) {
  if (!this.uuid) {
    this.uuid = uuid.v4();
  }
  next()
})

ArticleSchema.post('save', function (error: any, doc: any, next: any) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Article uuid is not unique'));
  } else {
    next(error);
  }
});

ArticleSchema.methods.attachMedia = function (filename: string) {
  const media = [...this.media]
  if (filename && filename.length) {
    media.push(filename)
    this.media = media
    return { message: "Media insertion succed" }
  } else {
    return { message: "Media insertion failed" }
  }
}


ArticleSchema.methods.deleteMedia = function (filename: string) {
  const media = [...this.media]
  const index = media.indexOf(filename);
  if (index > -1) {
    media.splice(index, 1);
    this.media = media
    return { message: "Media deletition succeed" }
  } else {
    return { message: "Media deletition failed. File is not found" }
  }

}


ArticleSchema.methods.toJSONFor = function () {
  return {
    uuid: this.uuid,
    text: this.text,
    author: this.author.toProfileJSONFor(),
    media: this.media,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
}

// };

export const Article: Model<IArticleModel> = model<IArticleModel>('Article', ArticleSchema);

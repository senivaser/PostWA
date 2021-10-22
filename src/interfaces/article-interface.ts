import User from '../database/models/user.model';


export interface IArticle {
  uuid: string;
  text: string;
  media: string[];
  createdAt: Date;
  updatedAt: Date;
  author: User;
  comments: Comment[]
}


export interface IQuery {
  tagList: { $in: any[] };
  author: string;
  _id: { $in: any[] };
}

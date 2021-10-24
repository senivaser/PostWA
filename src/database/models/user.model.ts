import { Document, Model, model, Schema } from 'mongoose';
import { IUser } from '../../interfaces/user-interface';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { JWT_SECRET } from "../../utilities/secrets";


export default interface IUserModel extends IUser, Document {
  token?: string;
  generateJWT(): string;
  toAuthJSON(): any;
  setPassword(password: string): void;
  validPassword(password: string): boolean;
  toProfileJSONFor(user: IUserModel): any;
}


// ISSUE: Own every parameter and any missing dependencies
const UserSchema = new Schema<any>({
  username: {
    type: Schema.Types.String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
    index: true
  },
  email: {
    type: Schema.Types.String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  },
  hash: {
    type: Schema.Types.String
  },
  salt: {
    type: Schema.Types.String
  },
  registered: {
    type: Date,
    default: Date.now()
  }
});


UserSchema.post('save', function (error: any, doc: any, next: any) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('email & username is already exist'));
  } else {
    next(error);
  }
});

UserSchema.methods.validPassword = function (password: string): boolean {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function (password: string) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT = function (): string {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: exp.getTime() / 1000,
  }, JWT_SECRET);
};

UserSchema.methods.toAuthJSON = function (): any {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
  };
};

UserSchema.methods.toProfileJSONFor = function () {
  return this.username
};

export const User: Model<IUserModel> = model<IUserModel>('User', UserSchema);

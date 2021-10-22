import { NextFunction, Request, Response, Router } from 'express';
import IUserModel, { User } from '../database/models/user.model';

const router: Router = Router();

router.post('/register', (req: Request, res: Response, next: NextFunction) => {

  const user: IUserModel = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  return user.save()
    .then(() => {
      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);

});


router.post('/login', (req: Request, res: Response, next: NextFunction) => {

  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: "Can't be blank" } });
  }

  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "Can't be blank" } });
  }

  User
    .findOne({ email: req.body.user.email })
    .then((user: IUserModel) => {
      if (user && user.validPassword(req.body.user.password)) {
        user.token = user.generateJWT();
        return res.json({ user: user.toAuthJSON() });
      } else {
        return res.status(422).json({ errors: { message: "Invalid username or password" } });
      }

    })
    .catch(next)

});


export const UsersRoutes: Router = router;

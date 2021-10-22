import { Router } from 'express';
import { UsersRoutes } from './users-routes';
import { ArticlesRoutes } from './articles-routes';


const router: Router = Router();


router.use('/auth', UsersRoutes);
router.use('/article', ArticlesRoutes);


export const MainRouter: Router = router;

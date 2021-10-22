"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRouter = void 0;
const express_1 = require("express");
const users_routes_1 = require("./users-routes");
const articles_routes_1 = require("./articles-routes");
const router = express_1.Router();
router.use('/auth', users_routes_1.UsersRoutes);
router.use('/article', articles_routes_1.ArticlesRoutes);
exports.MainRouter = router;
//# sourceMappingURL=index.js.map
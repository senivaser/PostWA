"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRoutes = void 0;
const express_1 = require("express");
const user_model_1 = require("../database/models/user.model");
const router = express_1.Router();
router.post('/register', (req, res, next) => {
    const user = new user_model_1.User();
    user.username = req.body.user.username;
    user.email = req.body.user.email;
    user.setPassword(req.body.user.password);
    return user.save()
        .then(() => {
        return res.json({ user: user.toAuthJSON() });
    })
        .catch(next);
});
router.post('/login', (req, res, next) => {
    if (!req.body.user.email) {
        return res.status(422).json({ errors: { email: "Can't be blank" } });
    }
    if (!req.body.user.password) {
        return res.status(422).json({ errors: { password: "Can't be blank" } });
    }
    user_model_1.User
        .findOne({ email: req.body.user.email })
        .then((user) => {
        if (user && user.validPassword(req.body.user.password)) {
            user.token = user.generateJWT();
            return res.json({ user: user.toAuthJSON() });
        }
        else {
            return res.status(422).json({ errors: { message: "Invalid username or password" } });
        }
    })
        .catch(next);
});
exports.UsersRoutes = router;
//# sourceMappingURL=users-routes.js.map
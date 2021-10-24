"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swaggerDocs_1 = require("./utilities/swaggerDocs");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const error_handling_1 = require("./utilities/error-handling");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const secrets_1 = require("./utilities/secrets");
require("./database");
const dest = secrets_1.DEST;
const app = express_1.default();
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs_1.swaggerDocs));
app.use("/media", express_1.default.static(__dirname.split('/').slice(0, -1).join('/') + dest.substring(1)));
app.use(helmet_1.default());
app.use(compression_1.default());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true
}));
app.use('/api', routes_1.MainRouter);
error_handling_1.loadErrorHandlers(app);
exports.default = app;
//# sourceMappingURL=app.js.map
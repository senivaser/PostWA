"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "PostWA API",
            version: "1.0.0",
            description: "API приложения для создание заметок",
        },
        servers: [
            {
                url: "http://194.67.108.25:3000",
                name: "Deployment Server"
            },
            {
                url: "http://localhost:3000",
                name: "Local Server"
            },
        ],
    },
    apis: ["./src/routes/*.ts"],
};
exports.swaggerDocs = swagger_jsdoc_1.default(swaggerOptions);
//# sourceMappingURL=swaggerDocs.js.map
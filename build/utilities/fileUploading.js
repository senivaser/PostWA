"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.dest = void 0;
const multer_1 = __importDefault(require("multer"));
exports.dest = './uploads';
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, exports.dest);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
exports.upload = multer_1.default({ storage: storage });
//# sourceMappingURL=fileUploading.js.map
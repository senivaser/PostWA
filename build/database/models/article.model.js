"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const mongoose_1 = require("mongoose");
const uuid_1 = __importDefault(require("uuid"));
const ArticleSchema = new mongoose_1.Schema({
    uuid: {
        type: mongoose_1.Schema.Types.String,
    },
    text: {
        type: mongoose_1.Schema.Types.String
    },
    media: [{
            type: mongoose_1.Schema.Types.String
        }],
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true
});
ArticleSchema.pre('save', function (next) {
    if (!this.uuid) {
        this.uuid = uuid_1.default.v4();
    }
    next();
});
ArticleSchema.methods.attachMedia = function (filename) {
    const media = [...this.media];
    if (filename && filename.length) {
        media.push(filename);
        this.media = media;
        return { message: "Media insertion succed" };
    }
    else {
        return { message: "Media insertion failed" };
    }
};
ArticleSchema.methods.deleteMedia = function (filename) {
    const media = [...this.media];
    const index = media.indexOf(filename);
    if (index > -1) {
        media.splice(index, 1);
        this.media = media;
        return { message: "Media deletition succeed" };
    }
    else {
        return { message: "Media deletition failed. File is not found" };
    }
};
ArticleSchema.methods.toJSONFor = function () {
    return {
        uuid: this.uuid,
        text: this.text,
        author: this.author.toProfileJSONFor(),
        media: this.media,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};
// };
exports.Article = mongoose_1.model('Article', ArticleSchema);
//# sourceMappingURL=article.model.js.map
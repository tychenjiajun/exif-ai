#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDescription = getDescription;
var sharp_1 = require("sharp");
function sizeHandle(buffer_1) {
    return __awaiter(this, arguments, void 0, function (buffer, quality, drop) {
        var sharpInstance, _a, _b, width, _c, height, done;
        if (quality === void 0) { quality = 100; }
        if (drop === void 0) { drop = 2; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, sharp_1.default)(buffer)];
                case 1:
                    sharpInstance = _d.sent();
                    return [4 /*yield*/, sharpInstance.metadata()];
                case 2:
                    _a = _d.sent(), _b = _a.width, width = _b === void 0 ? 0 : _b, _c = _a.height, height = _c === void 0 ? 0 : _c;
                    return [4 /*yield*/, (0, sharp_1.default)(buffer)
                            .resize(__assign(__assign({}, (width > height ? { width: 6000 } : { height: 6000 })), { withoutEnlargement: true }))
                            .jpeg({
                            quality: quality,
                        })
                            .toBuffer()];
                case 3:
                    done = _d.sent();
                    _d.label = 4;
                case 4:
                    if (!(done.byteLength > 5000000)) return [3 /*break*/, 6];
                    quality = Math.max(quality - drop, 0);
                    return [4 /*yield*/, (0, sharp_1.default)(buffer)
                            .resize(__assign(__assign({}, (width > height ? { width: 6000 } : { height: 6000 })), { withoutEnlargement: true }))
                            .jpeg({
                            quality: quality,
                        })
                            .toBuffer()];
                case 5:
                    done = _d.sent();
                    return [3 /*break*/, 4];
                case 6: return [2 /*return*/, done];
            }
        });
    });
}
function getDescription(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var handled, response, data, error_1;
        var _c;
        var buffer = _b.buffer, _d = _b.model, model = _d === void 0 ? "glm-4v-plus" : _d, prompt = _b.prompt;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, sizeHandle(buffer)];
                case 1:
                    handled = _e.sent();
                    return [4 /*yield*/, fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
                            method: "POST",
                            headers: {
                                Authorization: "Bearer " + process.env.ZHIPUAI_API_KEY,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                model: model,
                                messages: [
                                    {
                                        role: "user",
                                        content: [
                                            {
                                                type: "image_url",
                                                image_url: {
                                                    url: Buffer.from(handled).toString("base64"),
                                                },
                                            },
                                            {
                                                type: "text",
                                                text: prompt,
                                            },
                                        ],
                                    },
                                ],
                                temperature: 0.5,
                            }),
                        })];
                case 2:
                    response = _e.sent();
                    if (!response.ok) {
                        throw new Error("API request failed with status ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _e.sent();
                    if ("choices" in data) {
                        return [2 /*return*/, (_c = data.choices.at(-1)) === null || _c === void 0 ? void 0 : _c.message.content];
                    }
                    else {
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _e.sent();
                    console.error("An error occurred while getting the description:", error_1);
                    throw error_1; // Re-throw the error to be handled by the caller
                case 5: return [2 /*return*/];
            }
        });
    });
}

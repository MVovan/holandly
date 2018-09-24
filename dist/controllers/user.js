"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
exports.requireLogin = (req, res) => {
    console.log(req.session.user);
    if (!req.session.user) {
        res.redirect('/login');
        console.log("redsir");
    }
    else {
        console.log(path_1.default.join(__dirname, '../public/personal.html'));
        res.sendFile(path_1.default.join(__dirname, '../public/personal.html'));
    }
};
exports.stopSession = (req, res) => {
    console.log(req.session.user);
    req.session.destroy(function (err) {
        if (err)
            throw err;
    });
};
//# sourceMappingURL=user.js.map
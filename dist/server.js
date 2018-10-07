"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const memorystore_1 = __importDefault(require("memorystore"));
const userModel = __importStar(require("./models/user"));
const morgan_1 = __importDefault(require("morgan"));
const user_1 = require("./routes/user");
const app = express_1.default();
userModel.dbConnect;
const memoryStore = memorystore_1.default(express_session_1.default);
app.use(express_session_1.default({
    secret: 'waffle',
    resave: false,
    saveUninitialized: true,
    store: new memoryStore({
        checkPeriod: 86400000
    })
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.text());
app.use(morgan_1.default(':method :url :status :res[content-length]'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use('/', user_1.userRouter);
app.use('/user');
app.listen(8130, () => {
    console.log('wat up');
});
//# sourceMappingURL=server.js.map
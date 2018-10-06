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
const body_parser_1 = __importDefault(require("body-parser"));
const userController = __importStar(require("../controllers/user"));
const userModel = __importStar(require("../models/user"));
exports.userRouter = express_1.default.Router();
exports.userRouter.use(body_parser_1.default.json());
exports.userRouter.get("/", userController.requireLogin);
exports.userRouter.route('/login')
    .get(userController.getLoginPage)
    .post(userModel.validateUser);
exports.userRouter.get('/logout', userController.stopSession);
exports.userRouter.route("/events")
    .get(userModel.sendAvailableEvents)
    .post(userModel.addEvent);
exports.userRouter.route('/pattern')
    .get(userModel.sendEventPatterns)
    .post(userModel.addNewEventPattern);
/*Returns all the scheduled events info */
exports.userRouter.get('/scheduled', userModel.sendScheduledEvents);
/* Returns all the existing event patterns */
//sort by id and data time
//userRouter.get('/events/available', userModel.sendAvailableEvents)
/* adds new pattern */
/* deletes the pattern by id specified in params, and then deletes all the events  */
exports.userRouter.delete('/pattern/*', userModel.deleteEventPattern);
exports.userRouter.delete('/events/*', userModel.deleteEvent);
exports.userRouter.delete('/cancel', userModel.deleteEventVisitor);
//userRouter.post('/events', )
//# sourceMappingURL=user.js.map
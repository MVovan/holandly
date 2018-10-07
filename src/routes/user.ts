import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import * as userController from "../controllers/user";
import * as userModel from "../models/user";

export const userRouter = express.Router();

userRouter.use(bodyParser.json());

userRouter.get("/", userController.requireLogin);

userRouter.route('/login')
.get(userController.getLoginPage)
.post(userModel.validateUser)

userRouter.get('/logout', userController.stopSession);
  
userRouter.route("/events")
.get(userModel.sendAvailableEvents)
.post(userModel.addEvent)
  

userRouter.route('/pattern')
.get(userModel.sendEventPatterns)
.post(userModel.addNewEventPattern)
.put(userModel.updateEventPattern)
  
  /*Returns all the scheduled events info */
userRouter.get('/scheduled', userModel.sendScheduledEvents);
 
  /* deletes the pattern by id specified in params, and then deletes all the events  */
userRouter.delete('/pattern/*', userModel.deleteEventPattern)
  
userRouter.delete('/events/*', userModel.deleteEvent)
  
userRouter.delete('/cancel', userModel.deleteEventVisitor)
  
  //userRouter.post('/events', )
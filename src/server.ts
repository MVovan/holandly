import express, { Request, Response } from "express";
import path from "path";
import bodyParser from 'body-parser';
import session from 'express-session';
import sessionStore from 'memorystore';
import nodemailer from 'nodemailer';

import * as userController from "./controllers/user";
import * as userModel from "./models/user";

userModel.dbConnect;

const memoryStore = sessionStore(session);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.text());


app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'waffle',
  resave: false,
  saveUninitialized: true,
  store: new memoryStore({
    checkPeriod: 86400000
  })
}))


app.get('/login', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public/login/Signin.html'));
})

app.post('/login', userModel.validateUser);


app.get("/", userController.requireLogin);

app.get('/logout', userController.stopSession);


/*Returns all the scheduled events info */
app.get('/scheduled', userModel.sendScheduledEvents);

/* Returns all the existing event patterns */
app.get('/pattern', userModel.sendEventPatterns)

//sort by id and data time
app.get('/events', userModel.sendAvailableEvents)

/* adds new pattern */
app.post('/pattern', userModel.addNewEventPattern)


/* deletes the pattern by id specified in params, and then deletes all the events  */
app.delete('/pattern/*', userModel.deleteEventPattern)

app.delete('/event/*', userModel.deleteEvent)

app.post('/events', userModel.addEvent)

app.listen(8130, () => {
    console.log('wat up');
  });
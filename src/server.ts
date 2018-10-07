import express, { Request, Response } from "express";
import path from "path";
import bodyParser from 'body-parser';
import session from 'express-session';
import sessionStore from 'memorystore';
import * as userController from "./controllers/user";
import * as userModel from "./models/user";
import morgan from 'morgan';
import { userRouter } from "./routes/user";


const app = express();

userModel.dbConnect;

const memoryStore = sessionStore(session);


app.use(session({
    secret: 'waffle',
    resave: false,
    saveUninitialized: true,
    store: new memoryStore({
      checkPeriod: 86400000
    })
  }))

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(morgan(':method :url :status :res[content-length]'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter)

app.use('/user')




app.listen(8130, () => {
    console.log('wat up');
  });
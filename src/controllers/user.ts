import { Request, Response } from "express";
import path from 'path';


export let requireLogin = (req: Request, res: Response) => {
    console.log(req.session.user);
    if (!req.session.user) {
      res.redirect('/login');
    } else {
        res.sendFile(path.join(__dirname, '../public/personal.html'));
    }
}

export let stopSession = (req: Request, res: Response) => {
        console.log(req.session.user);
        req.session.destroy(function(err: Error) {
           if(err) throw err;
        })
        res.redirect("/");
    }

export let getLoginPage = (req: Request, res: Response) => {
    res.set("WWW-Authenticate", "Basic")
    res.sendFile(path.join(__dirname, '../public/login/Signin.html'));
  }
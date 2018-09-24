import { Request, Response, NextFunction } from "express";

import path from 'path';

export let requireLogin = (req: Request, res: Response) => {
    console.log(req.session.user);
    if (!req.session.user) {
      res.redirect('/login');
      console.log("redsir");
    } else {
        console.log(path.join(__dirname, '../public/personal.html'));
        res.sendFile(path.join(__dirname, '../public/personal.html'));
    }
}


export let stopSession = (req: Request, res: Response) => {
        console.log(req.session.user);
        req.session.destroy(function(err: Error) {
           if(err) throw err;
        })
    }
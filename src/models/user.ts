import mysql, { MysqlError } from 'mysql';
import { Request, Response, NextFunction } from 'express';
import path from 'path';

export const dbConnect = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '0',
    database: 'holandly'
  });
  

  export let validateUser = (req: Request, res: Response) => {
    dbConnect.query('select * from holandly.users where email=?', [req.body.email], function(err: MysqlError, usr: any, fields: any) {
      if(err) {
        console.log(err);
      } else {
        console.log(usr[0].password);
        if(usr) {
          if (req.body.password == usr[0].password) {
            req.session.user = req.body;
            return res.redirect('../../');
          } else {
            res.sendStatus(403).send("Incorrect password");
          }
        } else {
            res.sendStatus(403).send("User not found");
        }
      }
      
    })
  }

  export let sendScheduledEvents = (req: Request, res: Response) => {
    let scheduledEvents: any[] = [];
    dbConnect.query(`select visitors.name, visitors.email, eventsList.date, eventsList.time, eventPattern.type, eventPattern.number,
                eventPattern.duration, eventPattern.description, visitCount.occupied from holandly.eventVisitors
                inner join visitors on eventVisitors.visitorId = visitors.id
                inner join eventsList on eventVisitors.eventId = eventsList.id
                inner join eventPattern on eventsList.patternId = eventPattern.id
                left join (select eventId, COUNT(*) AS occupied from eventVisitors group by eventId) AS visitCount on eventsList.id = visitCount.eventId
                order by eventsList.date, eventsList.time;`
    , function(err: MysqlError, results: any, fields: any) {
      if(err) {
          res.sendStatus(404).send("Data retrieval failed");
      } else if(results.length > 0) {
        results.forEach(function(entry: any) {
            let event: any = {};
            event.name = entry.name;
            event.email = entry.email;
            event.date = entry.date;
            event.time = entry.time;
            event.type = entry.type;
            event.number = entry.number;
            event.duration = entry.duration;
            event.description = entry.description;
            event.occupied = entry.occupied;
            scheduledEvents.push(event);
          })
          res.send(JSON.stringify(scheduledEvents));
      } else {
        res.send("No scheduled events")
      } 
    })
  }

export let sendEventPatterns = (req: Request, res: Response) => {
    let respObjects: any[] = [];
    dbConnect.query(`select * from eventPattern;`, function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.sendStatus(404).send("Data retrieval failed");
      } else if(results.length > 0) {
        results.forEach(function(entry: any) {
            let eventObject: any = {};
            eventObject.id = entry.id;
            eventObject.type = entry.type;
            eventObject.number = entry.number;
            eventObject.duration = entry.duration;
            eventObject.description = entry.description;
            respObjects.push(eventObject);
          })
          res.end(JSON.stringify(respObjects));
      } else {
        res.end("No patterns yet")
      }
    })
  }

  export let sendAvailableEvents = (req: Request, res: Response) => {
    let respObjects: any[] = [];
    dbConnect.query(`select eventsList.*, visitCount.occupied, eventPattern.number, eventPattern.type from holandly.eventsList
                      inner join eventPattern on eventsList.patternId = eventPattern.id
                      left join (select eventId, COUNT(*) AS occupied from eventVisitors group by eventId) AS visitCount on eventsList.id = visitCount.eventId
                      order by date, time;`
    , function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.sendStatus(404).send("Data retrieval failed");
      } else if(results.length > 0) {
        results.forEach(function(entry: any) {
          let eventObject: any = {};
          eventObject.id = entry.id;
          eventObject.time = entry.time;
          eventObject.type = entry.type;
          eventObject.date = entry.date;
          eventObject.patternId = entry.patternId;
          eventObject.occupied = entry.occupied;
          eventObject.number = entry.number;
          respObjects.push(eventObject);
        })
        res.end(JSON.stringify(respObjects));
      } else {
        res.end("No events to show")
      }
    })
  }

  export let addNewEventPattern = (req: Request, res: Response) => {
    let pattern: any = req.body;
    console.log(pattern);
    dbConnect.query(`INSERT INTO eventPattern SET ?`, pattern,
    function(err: any, results: any, fields: any) {
      if(err) {
        res.sendStatus(404).send("Data retrieval failed");
      } else {
        res.end("Successful")
      }
    })
  }

  export let deleteEventPattern = (req: Request, res: Response) => {
    let patternId: string = req.params[0];
    console.log(patternId);
    dbConnect.query(`delete from eventPattern where eventPattern.id = ?`, patternId, function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.sendStatus(404).send("Data retrieval failed");
      } else {
        res.end("Successful")
      }
    })
  }

  export let deleteEvent = (req: Request, res: Response) => {
    let eventId: string[] = req.params[0];
    console.log(eventId);
    dbConnect.query(`delete from eventsList where eventsList.id = ?`, eventId, function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.sendStatus(404).send("Data retrieval failed");
      } else {
        res.end("Successful")
      }
    })
  }

  export let addEvent = (req: Request, res: Response) => {
    let event = req.body;
    console.log(req.body);
    console.log(event.time +"" + event.date);
    dbConnect.query(`insert into eventsList SET ? ON DUPLICATE KEY UPDATE time=?, date=?, patternId=?`
                      ,[event, event.time, event.date, event.patternId] , function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.sendStatus(404).send("Data retrieval failed");
      } else {
        res.end("Successful")
      }
    })
  }
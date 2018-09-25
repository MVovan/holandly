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
            res.send("Incorrect password");
          }
        } else {
            res.send("User not found");
        }
      }
      
    })
  }

  export let sendScheduledEvents = (req: Request, res: Response) => {
    
    dbConnect.query(`select visitors.name, visitors.email, eventsList.date, eventsList.time, eventPattern.type, eventPattern.number,
                eventPattern.duration, eventPattern.description, visitCount.occupied from holandly.eventVisitors
                inner join visitors on eventVisitors.visitorId = visitors.id
                inner join eventsList on eventVisitors.eventId = eventsList.id
                inner join eventPattern on eventsList.patternId = eventPattern.id
                left join (select eventId, COUNT(*) AS occupied from eventVisitors group by eventId) AS visitCount on eventsList.id = visitCount.eventId
                order by eventsList.date, eventsList.time, eventPattern.type;`
    , function(err: MysqlError, results: any, fields: any) {
      if(err) {
          res.send("Data retrieval failed");
      } else if(results.length > 0) {
        let scheduledEvents: any[] = [];
        let prevDate: any;
        let prevTime: any;
        let prevType: any;
        results.forEach(function(entry: any) {
          
          if(entry.date === prevDate) {
            if(entry.time === prevTime && entry.type === prevType) {
              scheduledEvents[scheduledEvents.length - 1]
              .appointments[scheduledEvents[scheduledEvents.length - 1].appointments.length - 1]
              .visitors.push(makeVisitorObject(entry));
            } else {
              prevTime = entry.time;
              prevType = entry.type;
              scheduledEvents[scheduledEvents.length - 1].push({
                time: prevTime,
                type: prevType,
                duration: entry.duration,
                description: entry.description,
                number: entry.number,
                occupied: entry.occupied,
                visitors: [makeVisitorObject(entry)]
              })
            }
          } else {
            let event: any = {};
            prevDate = event.date = entry.date;
            prevTime = entry.time;
            prevType = entry.type
            event.appointments = [{
              time: prevTime,
              type: prevType,
              duration: entry.duration,
              description: entry.description,
              number: entry.number,
              occupied: entry.occupied,
              visitors: [makeVisitorObject(entry)]
            }];
            scheduledEvents.push(event);
          }
            
        })
        console.log(scheduledEvents);
        res.send(JSON.stringify(scheduledEvents));
      } else {
        res.json("No scheduled events");
      } 
    })
  }

  let makeVisitorObject = (entry: any): any => {
    return {
      name: entry.name,
      email: entry.email,
    }
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
        res.json("No patterns yet");
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
        res.json("No events to show");
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
        res.json("Successful");
      }
    })
  }

  export let deleteEventPattern = (req: Request, res: Response) => {
    let patternId: string = req.params[0];
    console.log(patternId);
    dbConnect.query(`delete from eventPattern where eventPattern.id = ?`, patternId, function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.send("Data retrieval failed");
      } else {
        res.send("Successful")
      }
    })
  }

  export let deleteEvent = (req: Request, res: Response) => {
    let eventId: string[] = req.params[0];
    console.log(eventId);
    dbConnect.query(`delete from eventsList where eventsList.id = ?`, eventId, function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.send("Data retrieval failed");
      } else {
        res.json("Successful");
      }
    })
  }

  export let addEvent = (req: Request, res: Response) => {
    let event: any = req.body;
    console.log(req.body);
    console.log(event[0].time +"" + event[0].date);
    dbConnect.query(`insert into eventsList SET ? ON DUPLICATE KEY UPDATE time=?, date=?, patternId=?`
                      ,[event[0], event[0].time, event[0].date, event[0].patternId] , function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.send("Data retrieval failed");
      } else {
        res.json("Successful");
      }
    })
  }
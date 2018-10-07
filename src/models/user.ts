import mysql, { MysqlError } from 'mysql';
import { Request, Response} from 'express';


export const dbConnect = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '0',
    database: 'holandly'
  });
  

  export let validateUser = (req: Request, res: Response) => {
    /* let authHeader = req.headers.authorization;
    if (!authHeader) {
      res.setHeader('WWW-Authenticate', 'Basic');
      res.status(401).json("Unauthorized");
      return;
    }

    let auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');
    let user = auth[0];
    let pass = auth[1];
    */

    dbConnect.query('select * from holandly.users where login=?', [req.body.email], function(err: MysqlError, usr: any, fields: any) {
      if(err) {
        console.log(err);
      } else {
        if(usr.length > 0) {
          if (req.body.password == usr[0].password) {
            req.session.user = req.body;
            req.session.user.id = usr[0].userId;
            delete req.session.user.password;
            res.status(200).json();
            
          } else {
            res.status(401).json("Incorrect password");
          }
        } else {
            res.status(401).json("User not found");
        }
      }
      
    })
  }

  export let sendScheduledEvents = (req: Request, res: Response) => {
    
    dbConnect.query(`select visitors.name, visitors.email, eventslist.date, eventslist.time, eventslist.patternId, eventvisitors.eventId, eventpattern.type, eventpattern.number,
                eventpattern.duration, eventpattern.description, visitCount.occupied from holandly.eventvisitors
                inner join visitors on eventvisitors.visitorId = visitors.visitorId
                inner join eventslist on eventvisitors.eventId = eventslist.eventId
                inner join eventpattern on eventslist.patternId = eventpattern.patternId
                left join (select eventId, COUNT(*) AS occupied from eventvisitors group by eventId) AS visitCount on eventslist.eventId = visitCount.eventId
                order by eventslist.date, eventslist.time, eventpattern.type;`
    , function(err: MysqlError, results: any, fields: any) {
      if(err) {
          res.json("Data retrieval failed");
      } else if(results.length > 0) {
        let scheduledEvents: any[] = [];
        let prevDate: any;
        let prevTime: any;
        let prevType: any;
        results.forEach(function(entry: any) {
          
          if(+entry.date === +prevDate) {
            if(entry.time === prevTime && entry.type === prevType) {
              scheduledEvents[scheduledEvents.length - 1]
              .appointments[scheduledEvents[scheduledEvents.length - 1].appointments.length - 1]
              .visitors.push(makeVisitorObject(entry));
            } else {
              prevTime = entry.time;
              prevType = entry.type;
              scheduledEvents[scheduledEvents.length - 1].appointments.push(makeAppointment(entry, prevTime, prevType))
            }
          } else {
            let event: any = {};
            prevDate = event.date = entry.date;
            prevTime = entry.time;
            prevType = entry.type
            event.appointments = [makeAppointment(entry, prevTime, prevType)];
            scheduledEvents.push(event);
          }
            
        })
        res.send(JSON.stringify(scheduledEvents));
      } else {
        res.json("No scheduled events");
      } 
    })
  }

  const makeAppointment = (entry: any, prevTime: any, prevType: any) => {
    return {
      time: prevTime,
      type: prevType,
      patternId: entry.patternId,
      eventId: entry.eventId,
      duration: entry.duration,
      description: entry.description,
      number: entry.number,
      occupied: entry.occupied === null ? 0: entry.occupied,
      visitors: [makeVisitorObject(entry)]
    }
  }

  const makeVisitorObject = (entry: any): any => {
    return {
      name: entry.name,
      email: entry.email,
    }
  }

export let sendEventPatterns = (req: Request, res: Response) => {
    let respObjects: any[] = [];
    dbConnect.query(`select * from eventpattern;`, function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.json("Data retrieval failed");
      } else if(results.length > 0) {
        results.forEach(function(entry: any) {
            let eventObject: any = {};
            eventObject.patternId = entry.patternId;
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
    dbConnect.query(`select eventslist.*, visitCount.occupied, eventpattern.number, eventpattern.type from holandly.eventslist
                      inner join eventpattern on eventslist.patternId = eventpattern.patternId
                      left join (select eventId, COUNT(*) AS occupied from eventvisitors group by eventId) AS visitCount on eventslist.eventId = visitCount.eventId
                      order by date, time;`
    , function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.json("Data retrieval failed");
      } else if(results.length > 0) {
        results.forEach(function(entry: any) {
          let eventObject: any = {};
          eventObject.eventId = entry.eventId;
          eventObject.time = entry.time;
          eventObject.type = entry.type;
          eventObject.date = entry.date;
          eventObject.patternId = entry.patternId;
          eventObject.occupied = entry.occupied === null ? 0: entry.occupied;
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
    let user = req.session.user.id;
    let type = req.body.type;
    let pattern: any[] = [type, req.body.number, req.body.duration, req.body.description, user
      , type, user];
    //console.log(pattern);
    dbConnect.query(`insert into eventpattern (type, number, duration, description, userId)
                      select ?, ?, ?, ?, ?
                      where not exists (select * from eventpattern where
                      (type=? and userId = ?));`, pattern, 
    function(err: any, results: any, fields: any) {
      
      if(err) {
        console.log(err);
        res.json("Data retrieval failed");
      } else {
        console.log(results.affectedRows)
        res.json("Successful");
      }
    })
  }
  //new method to update existing pattern details   and p.duration=? and p.description=? , req.body.duration, req.body.description
  export let updateEventPattern = (req: Request, res: Response) => {
    let patternId: any = req.body.patternId;
    delete req.body.patternId;
    dbConnect.query(`update eventpattern set ?
                    where patternId=? and not exists (select * from
                    (select * from holandly.eventpattern p where (p.type=? and p.userId=? )) as tmp)`
                    , [req.body, patternId, req.body.type, req.session.user.id], function(err: any, results: any, fields: any) {
      if(err) {
        console.log(err);
        res.json("Data retrieval failed");
      } else {
        console.log(results.affectedRows)
        res.json("Successful");
      }
    })
  }

  export let deleteEventPattern = (req: Request, res: Response) => {
    let patternId: string = req.params[0];
    console.log(patternId);
    dbConnect.query(`delete from eventpattern where eventpattern.patternId = ?`, patternId, function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.json("Data retrieval failed");
      } else {
        res.json("Successful")
      }
    })
  }

  export let deleteEvent = (req: Request, res: Response) => {
    let eventId: string[] = req.params[0];
    console.log(eventId);
    dbConnect.query(`delete from eventslist where eventslist.eventId = ?`, eventId, function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.json("Data retrieval failed");
      } else {
        console.log(results.affectedRows);
        res.json("Successful");
      }
    })
  }

  export let deleteEventVisitor = (req: Request, res: Response) => {
    let eventRecord: any = [req.body.eventId, req.body.email];
    dbConnect.query(`delete from eventvisitors where eventId = ? and visitorId = 
    (select visitors.visitorId from visitors where email=?)`, eventRecord, function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.json("Data retrieval failed");
      } else {
        console.log(results.affectedRows);
        res.json("Successful");
      }
    })
  }

  export let addEvent = (req: Request, res: Response) => {
    console.log(req.session);
    let event: any = req.body;
    delete event[0].reason; //the reason is saved on front end in the form
    console.log(req.body);
    console.log(event[0].time + "" + event[0].date);
    dbConnect.query(`insert into eventslist SET ? ON DUPLICATE KEY UPDATE time=?,date=?, patternId=?`
                      ,[event[0], event[0].time, event[0].date, event[0].patternId] , function(err: MysqlError, results: any, fields: any) {
      if(err) {
        res.json("Data retrieval failed");
      } else {
        res.json("Successful");
      }
    })
  }
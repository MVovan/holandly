import express from "express";
import path from "path";
import mysql from 'mysql';
import bodyParser from 'body-parser';
import { ServerResponse, ServerRequest, ClientRequest } from "http";
import expressSession from 'express-session';
import sessionStore from 'memorystore';

const memoryStore = sessionStore(expressSession);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.text());

app.use(expressSession({
  secret: 'waffle',
  store: new memoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  })
}))

app.use(express.static(path.join(__dirname, "public")));


const dbConnection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '0',
  database: 'holandly'
});
/*
dbConnection.query(`select visitors.name, visitors.email, eventsList.date, eventsList.time, eventPattern.type from holandly.eventVisitors
                      inner join visitors on eventVisitors.visitorId = visitors.id
                      inner join eventsList on eventVisitors.eventId = eventsList.id
                      inner join eventPattern on eventsList.patternId = eventPattern.id;`, function(err: any, results: any, fields: any) {
  if(err) throw err;
  console.log(results);  
})*/


app.get('/scheduled', function(req: ServerRequest, res: ServerResponse) {
  let scheduledEvents: any[] = [];
  dbConnection.query(`select visitors.name, visitors.email, eventsList.date, eventsList.time, eventPattern.type, eventPattern.number,
                      eventPattern.duration, eventPattern.description from holandly.eventVisitors
                      inner join visitors on eventVisitors.visitorId = visitors.id
                      inner join eventsList on eventVisitors.eventId = eventsList.id
                      inner join eventPattern on eventsList.patternId = eventPattern.id
                      order by eventsList.date, eventsList.time;`, function(err: any, results: any, fields: any) {
    if(err) throw err;
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
      scheduledEvents.push(event);
    })
    res.end(JSON.stringify(scheduledEvents));
  })
})

app.get('/data', function(req: ServerRequest, res: ServerResponse) {
  let respObjects: any[] = [];
  dbConnection.query(`select * from eventPattern;`, function(err: any, results: any, fields: any) {
    if(err) throw err;
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
  })
})
//sort by id and data time
app.get('/events', function(req: ServerRequest, res: ServerResponse) {
  let respObjects: any[] = [];
  dbConnection.query(`select * from eventsList order by date, time;`, function(err: any, results: any, fields: any) {
    if(err) throw err;
    results.forEach(function(entry: any) {
      let eventObject: any = {};
      eventObject.id = entry.id;
      eventObject.time = entry.time;
      eventObject.date = entry.date;
      eventObject.patternId = entry.patternId;
      respObjects.push(eventObject);
    })
    res.end(JSON.stringify(respObjects));
  })
})

app.post('/pattern', function(req: any, res: ServerResponse) {
  let pattern: any = req.body;
  console.log(pattern);
  dbConnection.query(`INSERT INTO eventPattern SET ?`, pattern,
  function(err: any, results: any, fields: any) {
    if(err) throw err;
    
  })
})
/*
app.post('/events',function(req: any, res: ServerResponse) {
  let events: any = req.body;
  console.log(events);
  events.forEach(function(entry: any) {
    dbConnection.query(`INSERT INTO eventsList SET ?`, entry, function(err: any, results: any, fields: any) {
      if(err) throw err;
    
    })
  })
}) */

app.delete('/pattern/*',function(req: any, res: ServerResponse) {
  let patternId: string[] = [];
  patternId.push(req.params[0]);
  console.log(patternId);
  dbConnection.query(`DELETE eventPattern, eventsList, eventVisitors, visitors FROM eventPattern
                      INNER JOIN eventsList ON eventPattern.id = eventsList.patternId
                      inner join eventVisitors on eventsList.id = eventVisitors.eventId
                      inner join visitors on eventVisitors.visitorId = visitors.id
                      WHERE eventPattern.id=?`, patternId, function(err: any, results: any, fields: any) {
    if(err) throw err;
    console.log("destroyed")
  })
})

app.delete('/event/*',function(req: any, res: ServerResponse) {
  let eventId: string[] = [];
  eventId.push(req.params[0]);
  console.log(eventId);
  dbConnection.query(`DELETE eventsList, eventVisitors, visitors FROM eventsList
                      inner join eventVisitors on eventsList.id = eventVisitors.eventId
                      inner join visitors on eventVisitors.visitorId = visitors.id
                      WHERE eventsList.id=?`, eventId, function(err: any, results: any, fields: any) {
    if(err) throw err;
    console.log("destroyed")
  })
})

app.post('/event',function(req: any, res: ServerResponse) {
  let event = req.body;
  console.log(req.body);
  console.log(event.time +"" + event.date);
  dbConnection.query(`insert into eventsList SET ?
                      ON DUPLICATE KEY UPDATE time=?, date=?, patternId=?`, [event, event.time, event.date, event.patternId] , function(err: any, results: any, fields: any) {
    if(err) throw err;
    console.log("updated")
  })
})

app.listen(8130, () => {
    console.log('wat up');
  });
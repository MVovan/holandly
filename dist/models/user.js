"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
exports.dbConnect = mysql_1.default.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin',
    database: 'holandly'
});
exports.validateUser = (req, res) => {
    exports.dbConnect.query('select * from holandly.users where login=?', [req.body.email], function (err, usr, fields) {
        if (err) {
            console.log(err);
        }
        else {
            if (usr.length > 0) {
                if (req.body.password == usr[0].password) {
                    req.session.user = req.body;
                    delete req.session.user.password;
                    res.status(200).json();
                }
                else {
                    res.status(401).json("Incorrect password");
                }
            }
            else {
                res.status(401).json("User not found");
            }
        }
    });
};
exports.sendScheduledEvents = (req, res) => {
    exports.dbConnect.query(`select visitors.name, visitors.email, eventslist.date, eventslist.time, eventslist.patternId, eventvisitors.eventId, eventpattern.type, eventpattern.number,
                eventpattern.duration, eventpattern.description, visitCount.occupied from holandly.eventvisitors
                inner join visitors on eventvisitors.visitorId = visitors.visitorId
                inner join eventslist on eventvisitors.eventId = eventslist.eventId
                inner join eventpattern on eventslist.patternId = eventpattern.patternId
                left join (select eventId, COUNT(*) AS occupied from eventvisitors group by eventId) AS visitCount on eventslist.eventId = visitCount.eventId
                order by eventslist.date, eventslist.time, eventpattern.type;`, function (err, results, fields) {
        if (err) {
            res.json("Data retrieval failed");
        }
        else if (results.length > 0) {
            let scheduledEvents = [];
            let prevDate;
            let prevTime;
            let prevType;
            results.forEach(function (entry) {
                if (+entry.date === +prevDate) {
                    if (entry.time === prevTime && entry.type === prevType) {
                        scheduledEvents[scheduledEvents.length - 1]
                            .appointments[scheduledEvents[scheduledEvents.length - 1].appointments.length - 1]
                            .visitors.push(makeVisitorObject(entry));
                    }
                    else {
                        prevTime = entry.time;
                        prevType = entry.type;
                        scheduledEvents[scheduledEvents.length - 1].appointments.push(makeAppointment(entry, prevTime, prevType));
                    }
                }
                else {
                    let event = {};
                    prevDate = event.date = entry.date;
                    prevTime = entry.time;
                    prevType = entry.type;
                    event.appointments = [makeAppointment(entry, prevTime, prevType)];
                    scheduledEvents.push(event);
                }
            });
            res.send(JSON.stringify(scheduledEvents));
        }
        else {
            res.json("No scheduled events");
        }
    });
};
const makeAppointment = (entry, prevTime, prevType) => {
    return {
        time: prevTime,
        type: prevType,
        patternId: entry.patternId,
        eventId: entry.eventId,
        duration: entry.duration,
        description: entry.description,
        number: entry.number,
        occupied: entry.occupied === null ? 0 : entry.occupied,
        visitors: [makeVisitorObject(entry)]
    };
};
const makeVisitorObject = (entry) => {
    return {
        name: entry.name,
        email: entry.email,
    };
};
exports.sendEventPatterns = (req, res) => {
    let respObjects = [];
    exports.dbConnect.query(`select * from eventpattern;`, function (err, results, fields) {
        if (err) {
            res.json("Data retrieval failed");
        }
        else if (results.length > 0) {
            results.forEach(function (entry) {
                let eventObject = {};
                eventObject.id = entry.id;
                eventObject.type = entry.type;
                eventObject.number = entry.number;
                eventObject.duration = entry.duration;
                eventObject.description = entry.description;
                respObjects.push(eventObject);
            });
            res.end(JSON.stringify(respObjects));
        }
        else {
            res.json("No patterns yet");
        }
    });
};
exports.sendAvailableEvents = (req, res) => {
    let respObjects = [];
    exports.dbConnect.query(`select eventslist.*, visitCount.occupied, eventpattern.number, eventpattern.type from holandly.eventslist
                      inner join eventpattern on eventslist.patternId = eventpattern.patternId
                      left join (select eventId, COUNT(*) AS occupied from eventvisitors group by eventId) AS visitCount on eventslist.eventId = visitCount.eventId
                      order by date, time;`, function (err, results, fields) {
        if (err) {
            res.json("Data retrieval failed");
        }
        else if (results.length > 0) {
            results.forEach(function (entry) {
                let eventObject = {};
                eventObject.id = entry.id;
                eventObject.time = entry.time;
                eventObject.type = entry.type;
                eventObject.date = entry.date;
                eventObject.patternId = entry.patternId;
                eventObject.occupied = entry.occupied === null ? 0 : entry.occupied;
                eventObject.number = entry.number;
                respObjects.push(eventObject);
            });
            res.end(JSON.stringify(respObjects));
        }
        else {
            res.json("No events to show");
        }
    });
};
exports.addNewEventPattern = (req, res) => {
    let pattern = [req.body.type, req.body.number, req.body.duration, req.body.description,
        req.body.type, req.body.number, req.body.duration];
    //console.log(pattern);
    exports.dbConnect.query(`insert into eventpattern (type, number, duration, description)
                      select ?, ?, ?, ?
                      where not exists (select * from eventpattern where
                      (type=? and number=? and duration=?));`, pattern, function (err, results, fields) {
        if (err) {
            console.log(err);
            res.json("Data retrieval failed");
        }
        else {
            console.log(results.affectedRows);
            res.json("Successful");
        }
    });
};
exports.deleteEventPattern = (req, res) => {
    let patternId = req.params[0];
    console.log(patternId);
    exports.dbConnect.query(`delete from eventpattern where eventpattern.patternId = ?`, patternId, function (err, results, fields) {
        if (err) {
            res.json("Data retrieval failed");
        }
        else {
            res.json("Successful");
        }
    });
};
exports.deleteEvent = (req, res) => {
    let eventId = req.params[0];
    console.log(eventId);
    exports.dbConnect.query(`delete from eventslist where eventslist.eventId = ?`, eventId, function (err, results, fields) {
        if (err) {
            res.json("Data retrieval failed");
        }
        else {
            console.log(results.affectedRows);
            res.json("Successful");
        }
    });
};
exports.deleteEventVisitor = (req, res) => {
    let eventRecord = [req.body.eventId, req.body.email];
    exports.dbConnect.query(`delete from eventvisitors where eventId = ? and visitorId = 
    (select visitors.visitorId from visitors where email=?)`, eventRecord, function (err, results, fields) {
        if (err) {
            res.json("Data retrieval failed");
        }
        else {
            console.log(results.affectedRows);
            res.json("Successful");
        }
    });
};
exports.addEvent = (req, res) => {
    console.log(req.session);
    let event = req.body;
    delete event[0].reason;
    console.log(req.body);
    console.log(event[0].time + "" + event[0].date);
    exports.dbConnect.query(`insert into eventslist SET ? ON DUPLICATE KEY UPDATE time=?,date=?, patternId=?`, [event[0], event[0].time, event[0].date, event[0].patternId], function (err, results, fields) {
        if (err) {
            res.json("Data retrieval failed");
        }
        else {
            res.json("Successful");
        }
    });
};
//# sourceMappingURL=user.js.map
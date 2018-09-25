"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
exports.dbConnect = mysql_1.default.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '0',
    database: 'holandly'
});
exports.validateUser = (req, res) => {
    exports.dbConnect.query('select * from holandly.users where email=?', [req.body.email], function (err, usr, fields) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(usr[0].password);
            if (usr) {
                if (req.body.password == usr[0].password) {
                    req.session.user = req.body;
                    return res.redirect('../../');
                }
                else {
                    res.sendStatus(403).send("Incorrect password");
                }
            }
            else {
                res.sendStatus(403).send("User not found");
            }
        }
    });
};
exports.sendScheduledEvents = (req, res) => {
    exports.dbConnect.query(`select visitors.name, visitors.email, eventsList.date, eventsList.time, eventPattern.type, eventPattern.number,
                eventPattern.duration, eventPattern.description, visitCount.occupied from holandly.eventVisitors
                inner join visitors on eventVisitors.visitorId = visitors.id
                inner join eventsList on eventVisitors.eventId = eventsList.id
                inner join eventPattern on eventsList.patternId = eventPattern.id
                left join (select eventId, COUNT(*) AS occupied from eventVisitors group by eventId) AS visitCount on eventsList.id = visitCount.eventId
                order by eventsList.date, eventsList.time;`, function (err, results, fields) {
        if (err) {
            res.sendStatus(404).send("Data retrieval failed");
        }
        else if (results.length > 0) {
            let scheduledEvents = [];
            let prevDate;
            let prevTime;
            results.forEach(function (entry) {
                if (entry.date === prevDate) {
                    if (entry.time === prevTime) {
                        scheduledEvents[scheduledEvents.length - 1]
                            .appointments[scheduledEvents[scheduledEvents.length - 1].appointments.length - 1]
                            .visitors.push(makeVisitorObject(entry));
                    }
                    else {
                        prevTime = entry.time;
                        scheduledEvents[scheduledEvents.length - 1].push({
                            time: prevTime,
                            visitors: [makeVisitorObject(entry)]
                        });
                    }
                }
                else {
                    let event = {};
                    prevDate = event.date = entry.date;
                    prevTime = entry.time;
                    event.appointments = [{
                            time: prevTime,
                            visitors: [makeVisitorObject(entry)]
                        }];
                    scheduledEvents.push(event);
                }
            });
            console.log(scheduledEvents);
            res.send(JSON.stringify(scheduledEvents));
        }
        else {
            res.send("No scheduled events");
        }
    });
};
let makeVisitorObject = (entry) => {
    return {
        type: entry.type,
        name: entry.name,
        email: entry.email,
        duration: entry.duration,
        description: entry.description,
        number: entry.number,
        occupied: entry.occupied
    };
};
exports.sendEventPatterns = (req, res) => {
    let respObjects = [];
    exports.dbConnect.query(`select * from eventPattern;`, function (err, results, fields) {
        if (err) {
            res.sendStatus(404).send("Data retrieval failed");
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
            res.end("No patterns yet");
        }
    });
};
exports.sendAvailableEvents = (req, res) => {
    let respObjects = [];
    exports.dbConnect.query(`select eventsList.*, visitCount.occupied, eventPattern.number, eventPattern.type from holandly.eventsList
                      inner join eventPattern on eventsList.patternId = eventPattern.id
                      left join (select eventId, COUNT(*) AS occupied from eventVisitors group by eventId) AS visitCount on eventsList.id = visitCount.eventId
                      order by date, time;`, function (err, results, fields) {
        if (err) {
            res.sendStatus(404).send("Data retrieval failed");
        }
        else if (results.length > 0) {
            results.forEach(function (entry) {
                let eventObject = {};
                eventObject.id = entry.id;
                eventObject.time = entry.time;
                eventObject.type = entry.type;
                eventObject.date = entry.date;
                eventObject.patternId = entry.patternId;
                eventObject.occupied = entry.occupied;
                eventObject.number = entry.number;
                respObjects.push(eventObject);
            });
            res.end(JSON.stringify(respObjects));
        }
        else {
            res.end("No events to show");
        }
    });
};
exports.addNewEventPattern = (req, res) => {
    let pattern = req.body;
    console.log(pattern);
    exports.dbConnect.query(`INSERT INTO eventPattern SET ?`, pattern, function (err, results, fields) {
        if (err) {
            res.sendStatus(404).send("Data retrieval failed");
        }
        else {
            res.end("Successful");
        }
    });
};
exports.deleteEventPattern = (req, res) => {
    let patternId = req.params[0];
    console.log(patternId);
    exports.dbConnect.query(`delete from eventPattern where eventPattern.id = ?`, patternId, function (err, results, fields) {
        if (err) {
            res.sendStatus(404).send("Data retrieval failed");
        }
        else {
            res.end("Successful");
        }
    });
};
exports.deleteEvent = (req, res) => {
    let eventId = req.params[0];
    console.log(eventId);
    exports.dbConnect.query(`delete from eventsList where eventsList.id = ?`, eventId, function (err, results, fields) {
        if (err) {
            res.sendStatus(404).send("Data retrieval failed");
        }
        else {
            res.end("Successful");
        }
    });
};
exports.addEvent = (req, res) => {
    let event = req.body;
    console.log(req.body);
    console.log(event.time + "" + event.date);
    exports.dbConnect.query(`insert into eventsList SET ? ON DUPLICATE KEY UPDATE time=?, date=?, patternId=?`, [event, event.time, event.date, event.patternId], function (err, results, fields) {
        if (err) {
            res.sendStatus(404).send("Data retrieval failed");
        }
        else {
            res.end("Successful");
        }
    });
};
//# sourceMappingURL=user.js.map
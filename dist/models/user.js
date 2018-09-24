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
    let scheduledEvents = [];
    exports.dbConnect.query(`select visitors.name, visitors.email, eventsList.date, eventsList.time, eventPattern.type, eventPattern.number,
                        eventPattern.duration, eventPattern.description from holandly.eventVisitors
                        inner join visitors on eventVisitors.visitorId = visitors.id
                        inner join eventsList on eventVisitors.eventId = eventsList.id
                        inner join eventPattern on eventsList.patternId = eventPattern.id
                        order by eventsList.date, eventsList.time;`, function (err, results, fields) {
        if (err) {
            res.sendStatus(404).send("Data retrieval failed");
        }
        else {
            results.forEach(function (entry) {
                let event = {};
                event.name = entry.name;
                event.email = entry.email;
                event.date = entry.date;
                event.time = entry.time;
                event.type = entry.type;
                event.number = entry.number;
                event.duration = entry.duration;
                event.description = entry.description;
                scheduledEvents.push(event);
            });
            res.send(JSON.stringify(scheduledEvents));
        }
    });
};
exports.sendEventPatterns = (req, res) => {
    let respObjects = [];
    exports.dbConnect.query(`select * from eventPattern;`, function (err, results, fields) {
        if (err) {
            res.sendStatus(404).send("Data retrieval failed");
        }
        else {
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
    });
};
exports.sendAvailableEvents = (req, res) => {
    let respObjects = [];
    exports.dbConnect.query(`select * from eventsList order by id, date, time;`, function (err, results, fields) {
        if (err) {
            res.sendStatus(404).send("Data retrieval failed");
        }
        else {
            results.forEach(function (entry) {
                let eventObject = {};
                eventObject.id = entry.id;
                eventObject.time = entry.time;
                eventObject.date = entry.date;
                eventObject.patternId = entry.patternId;
                respObjects.push(eventObject);
            });
            res.end(JSON.stringify(respObjects));
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
    });
};
exports.deleteEventPattern = (req, res) => {
    let patternId = req.params[0];
    console.log(patternId);
    exports.dbConnect.query(`delete from eventPattern where eventPattern.id = ?`, patternId, function (err, results, fields) {
        if (err) {
            res.sendStatus(404).send("Data retrieval failed");
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
    });
};
//# sourceMappingURL=user.js.map
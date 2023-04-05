const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user");
const Log = require("./models/log");
const cors = require("cors");
require("dotenv").config();

mongoose
  .connect(process.env.DBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongodb connected");
  });

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// POST to /api/users with form data username to create a new user.
app.post("/api/users", function (req, res) {
  const user = new User({
    username: req.body.username,
  });
  user.save().then((result) => {
    res.send(result);
  });
});

app.post("/api/users/:_id/exercises", function (req, res) {
  const id = req.params._id;
  if (req.body.date) {
    dateFromInput = new Date(req.body.date);
    date = dateFromInput.toDateString();
  } else {
    today = new Date();
    date = today.toDateString();
  }
  User.findOne({ _id: id }).then((result) => {
    if (result == null) {
      res.send("unknow user!");
    } else {
      userData = result;
      username = userData["username"];
      const exerciseToAdd = {
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: date,
      };
      Log.findByIdAndUpdate(id).then((result) => {
        if (result == null) {
          const newlog = new Log({
            username: username,
            count: 1,
            _id: id,
            log: [exerciseToAdd],
          });
          newlog.save().then((result) => {
            res.json({
              _id: result._id,
              username: result.username,
              description: result.log[0]["description"],
              duration: result.log[0]["duration"],
              date: result.log[0]["date"],
            });
          });
        } else {
          result.count++; //increment the counter- works here as we don't have a specification to delete entries - also seems to follow what __v is storing
          result.log.push(exerciseToAdd);
          result.save().then((result) => {
            res.json({
              _id: result._id,
              username: result.username,
              description: exerciseToAdd.description,
              duration: exerciseToAdd.duration,
              date: exerciseToAdd.date,
            });
          });
        }
      });
    }
  }); // better refactor + see how to do error in new idiomatic way if possible?
});

app.get("/api/users", function (req, res) {
  User.find({}).then((result) => {
    res.send(result);
  });
});

app.get("/api/users/:_id/logs", function (req, res) {
  const id = req.params._id;
  const onlythese = req.query.limit;
  const timePeriodFrom = req.query.from;
  const timePeriodTo = req.query.to;
  // console.log(typeof onlythese); //string which might be a problem

  if (timePeriodFrom || timePeriodTo) {
    const dateFrom = Date.parse(timePeriodFrom) || 0;
    const dateTo = Date.parse(timePeriodTo);
    Log.findById(id).then((result) => {
      const logsToSearchThrough = result.log;
      const filteredByDate = logsToSearchThrough.filter(
        (exercise) => Date.parse(exercise["date"]) >= dateFrom
      );
      if (dateTo) {
        const filteredByBothDates = filteredByDate.filter(
          (exercise) => Date.parse(exercise["date"]) <= dateTo
        );
        const finalFilteredLog = filteredByBothDates.slice(0, onlythese)
        res.json({
          username: result.username,
          count: result.count,
          _id: result._id,
          log: finalFilteredLog
        });
      } else {
        const finalFilteredLog = filteredByDate.slice(0, onlythese)
        res.json({
          username: result.username,
          count: result.count,
          _id: result._id,
          log: finalFilteredLog
        });
      }
    });
  } else {
    Log.findById(id).then((result) => {
      const finalFilteredLog = result.log.slice(0, onlythese)
      res.json({
        username: result.username,
        count: result.count,
        _id: result._id,
        log: finalFilteredLog
      });
    });
  }

  //http://localhost:3000/api/users/640799edfe3ca4272ad300ea/logs?limit=2 example query
  //http://localhost:3000/api/users/640799edfe3ca4272ad300ea/logs?to=2023-04-01

  //{createdAt:{$gte:ISODate(“2020-03-01”),$lt:ISODate(“2021-04-01”)}}
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

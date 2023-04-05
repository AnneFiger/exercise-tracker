const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const Log = require("./models/log");
const cors = require("cors");
require("dotenv").config();

const app = express();

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
app.use(express.urlencoded({ extended: true })); //true?
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
    res.send(
      result // see if need to get rid of v_ /use valueof ObjectId in response?
    );
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
    // if(result == null) {
    //   res.send('unknow user!');
    // }
    userData = result;
    username = userData["username"];
    const exerciseToAdd = {
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: date,
    };
    Log.findByIdAndUpdate(id).then((result) => { 
      if(result == null) {
        const newlog = new Log({
          username: username,
          count: 1,
          _id: id,
          log: [exerciseToAdd] //[]?
        });
        newlog.save().then((result) => {
          res.json({_id: result._id, username: result.username, description: result.log[0]["description"], duration: result.log[0]["duration"], date: result.log[0]["date"]})
          // res.send(result);
        });  
      }else{
        // console.log(result);
        // console.log(result.log[0]);
        // console.log(typeof result.log[0]); //object
        //here the id will go first, not sure if this is a problem. Probably due to how MongoDb stores data
        result.count ++; //increment the counter- works here as we don't have a specification to delete entries - also seems follow what __v is storing
        result.log.push(exerciseToAdd);
        result.save().then((result) => {
          res.json({_id: result._id, username: result.username, description: exerciseToAdd.description, duration: exerciseToAdd.duration, date: exerciseToAdd.date })
          // res.send(result); //select equivalent on result? or use key as above[""] .select({__v: 0})
        });
      }
    });    
  });// better refactor + see how to do error in new idiomatic way if possible?

});


app.get("/api/users", function (req, res) {
  User.find({}).then((result) => {
    res.send(result); //need to be res.json(??)
  });
});

app.get("/api/users/:_id/logs", function (req, res) {
  const id = req.params._id;
  const onlythese = req.query.limit;
  const timePeriodFrom = req.query.from;
  const timePeriodTo = req.query.to;
  // console.log(typeof onlythese); //string which might be a problem

  if(timePeriodFrom||timePeriodTo){
    const dateFrom = (Date.parse(timePeriodFrom))||0;
    const dateTo = (Date.parse(timePeriodTo));
    Log.findById(id)
     .then((result) => {
       const logsToSearchThrough = result.log;
       const filteredByDate = logsToSearchThrough.filter(exercise => (Date.parse(exercise["date"]) >= dateFrom));
       if(dateTo){
        const filteredByBothDates = filteredByDate.filter(exercise => (Date.parse(exercise["date"]) <= dateTo));
        res.send(filteredByBothDates.slice(0, onlythese));
        }else{
          res.send(filteredByDate.slice(0, onlythese));
        }
     });
  }else{
    Log.findById(id)
     .then((result) => {  
         
       res.send(result.log.slice(0, onlythese)); 
     });
  }

  // You can add from, to and limit parameters to a GET /api/users/:_id/logs request 
  // to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. 
  // limit is an integer of how many logs to send back.

  //http://localhost:3000/api/users/640799edfe3ca4272ad300ea/logs?limit=2 example query
  //http://localhost:3000/api/users/640799edfe3ca4272ad300ea/logs?to=2023-04-01

//   localhost:3000/show?name=luis&address=California&id=123', and your code you be like:

// app.get('/show', function(req, res) {
//     res.json({
//         name: req.query.name,
//         surname: req.query.surname,
//         address: req.query.address,
//         id: req.query.id,
//         phone: req.query.phone
//     });
// });

//{createdAt:{$gte:ISODate(“2020-03-01”),$lt:ISODate(“2021-04-01”)}}

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

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
app.use(express.urlencoded({ extended: false }));
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
    userData = result;
    const exerciseToAdd = {
      username: userData["username"],
      description: req.body.description,
      duration: req.body.duration,
      date: date,
    };
    Log.findById(id).then((result) => { //needs other block if no prior log entry- or code this when creating user??? //see similar implementation counter- TODO
      console.log(result);
      result.log.push(exerciseToAdd);
      result.save().then((result) => {
       res.send(result);
      });
    });    
  });// ... no longer accept a callback error search see how to do error in new idiomatic way if possible

  
  
//_id: id // problem duplicate key error cpllection if adding another exercise for same user     
  // User.findOne({ _id: id }).then((result) => { 
  //   userData = result; 
  //   exercise.save().then((result) => {
  //     res.send(result); //select equivalent on result? or use key as above[""] .select({__v: 0})
  //   });
  // })


});





app.get("/api/users", function (req, res) {
  User.find({}).then((result) => {
    res.send(result);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

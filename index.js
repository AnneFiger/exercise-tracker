const express = require('express');
const mongoose = require("mongoose");
const User = require("./models/user");
const Exercise = require("./models/exercise");
const cors = require('cors');
require('dotenv').config();

const app = express()


mongoose
  .connect(process.env.DBURL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
.then(() => {
  console.log('Mongodb connected');
});


app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



// POST to /api/users with form data username to create a new user.
app.post("/api/users", function (req, res) {
  const user = new User({
    username : req.body.username
  });
  user.save().then((result) => {
     res.send(
      result   // see if need to get rid of v_ /use valueof ObjectId in response?
     );
   })
});

app.post("/api/users/:_id/exercises", function(req, res) { 
  // res.send(req.body.duration); 
 
  const exercise = new Exercise({
    username : "harcoded for this round",
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date,
  });
  exercise.save().then((result) => {
    res.send(
      result
    );
  })
})

app.get("/api/users", function(req, res){
  User.find({}).then((result)=> {
    res.send(result)
  })
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

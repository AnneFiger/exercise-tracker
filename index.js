const express = require('express');
const mongoose = require("mongoose");
const User = require("./models/user");
const cors = require('cors');
require('dotenv').config();

const app = express()



mongoose
  .connect('mongodb+srv://annefiger:pChsE2BoyqEy8GXv@exercise-tracker.olxjy6t.mongodb.net/?retryWrites=true&w=majority',
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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



// You can POST to /api/users with form data username to create a new user.
app.post("/api/users", function (req, res) {
  const user = new User({
    username : req.body.username
  });
  user.save().then((result) => {
     res.send(
      result   // see if need to get rid of v_
     );
   })
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

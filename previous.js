const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
require('dotenv').config()
let bodyParser = require('body-parser')
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://sebastiangarciawork02:Shmongo42%2A@cluster0.tmtmwl0.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
const dns = require('dns');
const {ObjectId} = require('mongodb');

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// MONGOOSE CODE

let UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
});

let LogSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  count: {
    type: Number,
  },
  log: [{
    _id: false,
    description: {
      type: String,
    },
    duration: {
      type: Number,
    },
    date: {
      type: String,
    }
  }]
})

let User = mongoose.model('User', UserSchema);
let Log = mongoose.model('Log', LogSchema)

// MAIN EXPRESS FUNCTIONS
 
app.use('/api/users', bodyParser.urlencoded({extended: false}));

app.post('/api/users', async (req, res) => {
  let test = 'test';
  let userName = req.body.username;
  let newUser = new User({ username: userName });
  let savedUser = newUser.save();
  let id = newUser.id;
    res.json({
      username: userName,
      _id: id
  })
});

app.get('/api/users', (req, res) => {
  let test = 'test';
  User.find()
  .then((data) => {
    res.send(data)
  });
});

app.use('/api/users/:_id/exercises', bodyParser.urlencoded({extended: false}));

app.post('/api/users/:_id/exercises', async (req, res) => {
  let test = 'test';
  let id = req.params._id;
  console.log(id);
  let description = req.body.description;
  let duration = Number(req.body.duration);
  let finalDate = 0;
  if (req.body.date !== undefined) {
  let dateArray = req.body.date.split('-');
  let entryDate = new Date(dateArray[0], parseInt(dateArray[1], 10) - 1, dateArray[2]);
  if (!isNaN(entryDate) !== true) {
    entryDate = new Date();
  }
   finalDate = entryDate.toDateString();
} else {
   finalDate = new Date().toDateString();
}
  console.log('buffering')
  await User.findOne({_id: new ObjectId(id)})
  .then((data) => {
    console.log(data)
    return data.username
  })
  .then((data) => {
    let solution = Log.findOneAndUpdate({_id: new ObjectId(id)}, {username: data}, {new: true, upsert: true});
    return solution
  })
  .then((data) => {
    let solution = Log.findOneAndUpdate({_id: new ObjectId(id)}, {$push: {'log': {description: description, duration: duration, date: finalDate}}}, {new: true});
    return solution
  })
  .then((data) => {
    res.json({
      _id: data._id,
      username: data.username,
      date: finalDate,
      duration: duration,
      description: description,
    })
  });
})

app.use('/api/users/:_id/logs', bodyParser.urlencoded({extended: false}));

app.get('/api/users/:_id/logs', async (req, res) => {
  let test = 'test';
  let id = req.params._id;
  let from = Date.parse(req.query.from);
  let to = Date.parse(req.query.to);
  let limit = Number(req.query.limit);
  Log.findOne({_id: new ObjectId(id)})
  .then((data) => {
    let dataLog = data.log;
    if (!isNaN(from)) {
      dataLog = dataLog
      .filter(item => Date.parse(item.date) >= from)
    }
    if (!isNaN(to)) {
      dataLog = dataLog
      .filter(item => to >= Date.parse(item.date))
    }
    if (!isNaN(limit)) {
      dataLog = dataLog.slice(0, limit)
    }
    let dataLength = dataLog.length;
    res.json({
      _id: data._id,
      username: data.username,
      log: dataLog,
      count: dataLength
    })
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

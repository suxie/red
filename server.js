var express = require('express');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var Score = require('./models/score')


var app = express()
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/red')

// set the express view engine to take care of ejs within html files
app.engine('html', require('ejs').__express)
app.set('view engine', 'html')

app.use(bodyparser.urlencoded({ extended:false }));

app.use('/public', express.static('public'));

app.get('/', function(req, res, next) {
  Score.find({}).sort({highScore: -1}).exec(function(err, result) {
    if (err) next(err)
    res.render('index', {
      scores: result,
    })
  })
})

app.post('/', function(req, res, next) {
  res.redirect('/game');
})

app.get('/game', function(req, res, next) {
  res.render('game');
})

app.post('/game', function(req, res, next) {
  var name = req.body.name;
  var score = req.body.score;

  if (name != undefined && score != undefined) {
    var scoreObj = new Score({ scoreName: name, highScore: score})
    scoreObj.save(function(err) {
      if (!err) {
        res.redirect('/')
      } else {
        res.send(err.message)
      }
    })
  } else {
    res.redirect('/');
  }
})

app.listen(process.env.PORT || 3000, function() {
  console.log('App listening on port ' + (process.env.PORT || 3000))
})

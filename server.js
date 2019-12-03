var express = require('express');

var app = express()

// set the express view engine to take care of ejs within html files
app.engine('html', require('ejs').__express)
app.set('view engine', 'html')

app.use('/public', express.static('public'));

app.get('/', function(req, res, next) {
  res.render('index');
})

app.post('/', function(req, res, next) {
  res.render('game');
})

app.listen(process.env.PORT || 3000, function() {
  console.log('App listening on port ' + (process.env.PORT || 3000))
})

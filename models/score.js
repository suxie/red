var mongoose = require('mongoose')

var scoreSchema = new mongoose.Schema({
  scoreName: { type: String },
  highScore: { type: Number }
})

module.exports = mongoose.model('Score', scoreSchema)
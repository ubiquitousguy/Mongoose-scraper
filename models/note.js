//require mongoose
var mongoose = require('mongoose');
//create schema class
var Schema = mongoose.Schema;

//create the note Schema
var NoteSchema = new Schema({
  //just a String
  title: {
    type: String
  },
  //just a String
  body: {
    type: String
  },
});

// create the Note model with the NoteSchema
var Note = mongoose.model('Note', NoteSchema);

// export the Note model
module.exports = Note;

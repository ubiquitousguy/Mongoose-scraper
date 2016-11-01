//require Mongoose
var mongoose = require('mongoose');
//create Schema class
var Schema = mongoose.Schema

//create article Schema
var ArticleSchema = new Schema({
//title required
  title: {
    type: String,
    required: true
  },
//link required
  link: {
    type: String,
    required: true
  },
//this only saves one note's ObjectId. ref refers to the Note model.
  note: {
    type: Schema.Types.ObjectId,
    ref: 'Note'
  }
});

//Create the Article model with the ArticleSchema
var Article = mongoose.model('Article', ArticleSchema);

//export the module
module.exports = Article;

// dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
// Notice: Our scraping tools are prepared, too
var request = require('request');
var cheerio = require('cheerio');

// use morgan and bodyparser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
// make public a static dir
app.use(express.static('public'));

var database = {
    local: 'mongodb://local/mongoose-scraper',
    remote:'mongodb:ubiquitousguy:password7@ds143737.mlab.com:43737/mongoose-scraper'

}

var otherDB = database.remote;
mongoose.connect(otherDB);

db = mongoose.connection;

db.on('error', function (err) {
	console.log('Mongoose Error: ', err);
});
db.once('open', function () {
	console.log('DB connection: ',otherDb);
});

var PORT = process.env.PORT || 8080; // Sets an initial port. We'll use this later in our listener
//Require Schemas
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');

// Routes

//scrape articles, place in MongoDB, and return them in doc for rendering in browser
app.get('/articles', function(req, res){
    request('http://www.deadline.com/', function(error, response, html) {
    var $ = cheerio.load(html);
        var obj = {};
        var count = 0;
	    	$('article .article-inner').each(function(i, element) {
					var result = {};
					result.title = $(this).children('a').attr('title');
					result.link = $(this).children('a').attr('href');
					if(result.link.indexOf("http")<0){
						result.link='http://www.deadline.com'+result.link;
					}
          count++
          obj[count] = result;
					var entry = new Article (result);
					entry.save(function(err, doc) {
					  if (err) {
					    console.log(err);
					  }
					})
	    })
      res.json(obj);
      Article.find({}, function(err, doc){
				if (err){
					console.log(err);
				} else {
					res.json(doc);
				}
			})
	})
});

//this gets the article and note and returns as a JSON to be used when
//displaying the text box for the note.  (headline goes above text box)
app.get('/articles/:id', function(req, res){
	Article.findOne({'_id': req.params.id})
	.populate('note')
	.exec(function(err, doc){
		if (err){
			console.log(err);
		} else {
			res.json(doc);
		}
	});
});

//adds the note id to the article document as a reference back to the note
app.post('/savenote/:id', function(req, res){
	var newNote = new Note(req.body);

	newNote.save(function(err, doc){
		if(err){
			console.log(err);
		} else {
			Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
			.exec(function(err, doc){
				if (err){
					console.log(err);
				} else {
					res.send(doc);
				}
			});

		}
	});
});

//delete the note from both collections (article and notes)
app.post('/deletenote/:id', function(req, res){
			Article.find({'_id': req.params.id}, 'note', function(err,doc){
			// .exec(function(err, doc){
				if (err){
					console.log(err);
				}
				//deletes the note from the Notes Collection
					Note.find({'_id' : doc[0].note}).remove().exec(function(err,doc){
						if (err){
							console.log(err);
						}

					});

			});
			//deletes the note reference in the article document
			Article.findOneAndUpdate({'_id': req.params.id}, {$unset : {'note':1}})
			.exec(function(err, doc){
				if (err){
					console.log(err);
				} else {
					res.send(doc);
				}
			});
});

app.post('/dropdb', function(req,res){
//this function will delete all articles except those that have user notes.
//once it goes back to the client, the page will be refreshed which forces
//a new GET for the latest articles on the NYtimes Top Stores area of their home page.
	Article.find({})
		.populate('note')
		.exec(function(err, doc){
				if (err){
					console.log(err);
				} else {
							var removedArticles = 0;
						 for(i=0;i<doc.length;i++){
							// console.log(doc[i]._id);
							// console.log(doc[i].note);
							//if there is no note, we can remove the article from the db
							//but if there is a note, move on to the next article.

										if(doc[i].note==undefined){
												Article.find({'_id' : doc[i]._id}).remove()
												.exec(function(err, doc){
														if (err){
															console.log(err);
														}else{
															++removedArticles;
															console.log(removedArticles+" Total Articles removed");
														}
												})
										}
						}
				}
		})
res.end();
});
//start express server
app.listen(PORT, function() {
    console.log("Server listening on PORT: " + PORT);
  })

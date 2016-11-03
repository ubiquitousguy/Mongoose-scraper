//grab articles as a json
  $.getJSON('/articles', function(data) {
    //for each one
    console.log("data=",data);
    for (var i = 0; i<data.length; i++){
    //display info on page
    $('#articles').append('<p data-id="' + data[i]._id + '">'+ data[i].title + '<br />'+ data[i].link + '</p>');
}
});

$(document).on('click', 'p', function(){
  //empty notes from note section
  $('#notes').empty();
  //save id from p tag
  var thisId = $(this).attr('data-id');
//make ajax call for the article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId,
  })
    //add the notes information
    .done(function( data ) {
      //title of the article
      $('#notes').append('<h2>' + data.title + '</h2>');
      //input to put a new title
      $('#notes').append('<input id="titleinput" name="title" >');
      //textarea to add a new note
      $('#notes').append('<textarea id="bodyinput" name="body"></textarea>');
      // a button to submit a new note, with the id of the article saved to it
      $('#notes').append('<button data-id="' + data._id + '" id="savenote">Save Note</button>');

    //if there's a note in the article
      if(data.note){
        // place the title of the note in the title input
        $('#titleinput').val(data.note.title);
        // place the body of the note in the body textarea
        $('#bodyinput').val(data.note.body);
        $('#notes').append('<button data-id="' + data._id + '" id="deletenote">Delete Note</button>');
        $('#bodyinput,#titleinput').css('background-color', '#99ddff');
      }else{
        $('#notes').append('<button data-id="' + data._id + '" id="savenote">Save Note</button>');
        $('#bodyinput,#titleinput').css('background-color', '#99ddff');
      }
    });
});
//When the save note button is clicked POST to savenote on server
$(document).on('click', '#savenote', function(){
  var thisId = $(this).attr('data-id');

  $.ajax({
    method: "POST",
    url: "/savenote/" + thisId,
    data: {
      title: $('#titleinput').val(),// value taken from title input
      body: $('#bodyinput').val()// value taken from note textarea
    }
  })
    // with that done
    .done(function( data ) {
      // log the response
      console.log(data);
      // empty the notes section
      $('#notes').empty();
    });

    location.reload();
  $('#titleinput').val("");
  $('#bodyinput').val("");

});
//When the delete note button is clicked Post to deletenote on server
$(document).on('click', '#deletenote', function(){
  var thisId = $(this).attr('data-id');

  $.ajax({
    method: "POST",
    url: "/deletenote/" + thisId,
  })
    .done(function( data ) {

      console.log(data);
      $('#notes').empty();
    });

  location.reload();
  $('#titleinput').val("");
  $('#bodyinput').val("");
  
});

$(document).on('click', '#nytimeslogo', function(){
$('#head').css("color", "white");
  $.ajax({
    method: "POST",
    url: "/dropdb/"
  })
    .done(function( data ) {
      console.log("back from drop");
      $('#head').css("color", "black");
      //this will force a page refresh which will force a GET to '/' and that will force
      //the /scrape because it is the first thing that the JS does upon starting up.  ;-)
      location.reload();
    });

});

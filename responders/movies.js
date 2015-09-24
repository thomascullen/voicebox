var url = 'http://www.omdbapi.com/'

// is into the wild a good movie
voiceBox.addResponder(/Is (.+) a good movie/i, function(){
  var title = RegExp.$1
  respondWithRating(title);
})

// what is the rating for how i met your mother
voiceBox.addResponder(/What is the rating for (.+)/i, function(){
  var title = RegExp.$1
  respondWithRating(title);
})

// fetch the rating for a given title and respond with the rating
function respondWithRating(title){
  voiceBox.request(url+'?t='+title+'&y=&plot=short&r=json', function (error, response, body){
    var body = JSON.parse(body)
    voiceBox.respond(title+' has an average rating of '+body.imdbRating);
  });
}

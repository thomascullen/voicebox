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

// who directed into the wild
voiceBox.addResponder(/who directed (.+)/i, function(){
  var title = RegExp.$1
  voiceBox.request(url+'?t='+title+'&y=&plot=short&r=json', function (error, response, body){
    var body = JSON.parse(body);
    var director = body.Director
    voiceBox.respond(title+'was directed by '+director);
  });
})

// when was into the wild released
voiceBox.addResponder(/when was the movie (.+) released/i, function(){
  var title = RegExp.$1
  voiceBox.request(url+'?t='+title+'&y=&plot=short&r=json', function (error, response, body){
    var body = JSON.parse(body);
    voiceBox.respond(title+'was released on '+body.Released);
  });
})

// What is the movie into the wild about
voiceBox.addResponder(/what is the (movie|tv show)? (.+) about/i, function(){
  var title = RegExp.$2
  voiceBox.request(url+'?t='+title+'&y=&plot=short&r=json', function (error, response, body){
    var body = JSON.parse(body);
    voiceBox.respond(body.Plot);
  });
})

// fetch the rating for a given title and respond with the rating
function respondWithRating(title){
  voiceBox.request(url+'?t='+title+'&y=&plot=short&r=json', function (error, response, body){
    var body = JSON.parse(body)
    voiceBox.respond(title+' has an average rating of '+body.imdbRating);
  });
}

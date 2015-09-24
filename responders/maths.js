// addition
// what is 4 + 5
voiceBox.addResponder(/what is ([\d.]+) \+ ([\d.]+)/i, function(){
  var a = parseFloat(RegExp.$1);
  var b = parseFloat(RegExp.$2);
  var r = a + b
  var response = (number(a)+' + '+number(b)+' is'+ number(r))
  voiceBox.respond(response);
})

// subtraction
// what is 10 minus 5
voiceBox.addResponder(/what is ([\d.]+) \- ([\d.]+)/i, function(){
  var a = parseFloat(RegExp.$1);
  var b = parseFloat(RegExp.$2);
  var r = a - b
  var response = (number(a)+' minus '+number(b)+' is'+ number(r))
  voiceBox.respond(response);
})

// multiplication
// what is 2 multiplied by 10
voiceBox.addResponder(/what is ([\d.]+) x ([\d.]+)/i, function(){
  var a = parseFloat(RegExp.$1);
  var b = parseFloat(RegExp.$2);
  var r = a * b;
  var response = (number(a)+' multiplied by '+number(b)+' is'+ number(r))
  voiceBox.respond(response);
})

// division
// what is 10 divided by 2
voiceBox.addResponder(/what is ([\d.]+) ÷ ([\d.]+)/i, function(){
  var a = parseFloat(RegExp.$1);
  var b = parseFloat(RegExp.$2);
  var r = a / b;
  var response = (number(a)+' divided by '+number(b)+' is'+ number(r))
  voiceBox.respond(response);
})

// modulus
// what is the modulus of 20 divided by 6
voiceBox.addResponder(/what is the modulus of ([\d.]+) ÷ ([\d.]+)/i, function(){
  var a = parseFloat(RegExp.$1);
  var b = parseFloat(RegExp.$2);
  var r = a % b;
  var response = ('The modulus of '+number(a)+' divided by '+number(b)+' is'+ number(r))
  voiceBox.respond(response);
})

// percentage
// what is 10.5% of 340.5
voiceBox.addResponder(/what is ([\d.]+)% of ([\d.]+)/i, function(){
  var a = RegExp.$1;
  var b = RegExp.$2;
  var p = a / b * 100;
  voiceBox.respond(number(a)+'% of '+number(b)+' is'+ number(p));
})

// function to format a number for speach
function number(number){
  return number.toString().replace(/\./g, ' point ')
}

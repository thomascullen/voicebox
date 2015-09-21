![VoiceBox](assets/logo.png)

A voice control app built with [electron](http://electron.atom.io)

![example](http://thomascullen.io/voicebox/voicebox.gif)

## What can you do?
VoiceBox currently has a very limited set of sentences it understands. If you want to contribute to this, please look at the [adding responders](https://github.com/thomascullen/voicebox#adding-responders) section.

```
Hello
What time is it?
My name is Thomas
What's my name?
Tell me about [any topic]
What is a guitar
What's the weather like in Dublin
```

## Dev Setup
VoiceBox is built on top of [electron](http://electron.atom.io).
```
npm install
electron .
```
Now press `alt+s`

## Adding responders
Create a new javascript file for your responder in the `/responders` directory.
You can then use the `voiceBox.addResponder` method to define your responder.

The `addResponder` method takes two parameters:
- **regex** ( Regex ): The users input will be matched against this to determine if it should respond
- **response** ( Function ) : If the regex matches the input the response function will be called

The `voiceBox.respond(message)` method is then used inside the response function to output a response.

_NB: The response function is only called if it is the last responder to match the input_

```js
voiceBox.addResponder(/Hi|Hello|Hey/i, function(){
  voiceBox.respond("Hello")
})
```

### Responders with API requests
`voiceBox.request` can be used to make external API requests.

_NB: This uses the [request module](https://www.npmjs.com/package/request)_

```js
voiceBox.addResponder(/What's the weather like in (.*)/i, function(){
  voiceBox.request('http://api.openweathermap.org/data/2.5/weather?q='+RegExp.$1, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      voiceBox.respond(JSON.parse(body).weather[0].description)
    }
  })
})
```

### Respond with options
In some cases a responder may require the user to give more information. This can be done using the `voiceBox.addChoice` and `voiceBox.choice` methods.

First, you need to add a choice using the `voiceBox.addChoice` method. This works the exact same way as the `voiceBox.addResponder` method.

You can then respond asking for more information using the `voiceBox.choice(message)` method. This tells VoiceBox that we are asking for more information and will begin listening again after output of the message has finished.

```js
voiceBox.addResponder(/give me options/i, function(){
  voiceBox.addChoice(/one|1/i, function(){
    voiceBox.respond('You selected option one')
  })

  voiceBox.addChoice(/two|2/i, function(){
    voiceBox.respond('You selected option two')
  })

  voiceBox.choice('Do you want option one or option two?')
})
```

## Storing information
You can store information using the following methods
```js
voiceBox.db.set('users_name', 'thomas')
voiceBox.db.get('users_name')
```

## Todo
All the things

- Better application structure
- Improve documentation
- Ability to change config to pull in responses as npm packages ( similar to how [Hubot](https://hubot.github.com) handles scripts )

## License
VoiceBox is released under the [MIT License](http://opensource.org/licenses/MIT).

## Credits
The duckduckgo responder uses [their awesome API](https://duckduckgo.com/api)

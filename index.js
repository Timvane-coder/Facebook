//import app deps/libs
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

//initialize app
const app = express()

// Prevent Hackers
// To avoid displaying our tokens in raw codes 
// We set the server config (heroku) for verify token and fb access token
// to point to this variables defined (token and access).
const token = process.env.FB_VERIFY_TOKEN
const access = process.env.FB_ACCESS_TOKEN

// Set app to listen on hosting port(heroku in this case) else default(5000)
app.set('port', (process.env.PORT || 5000))

// Grab all static files from project directories
app.use('/css', express.static('css'));
app.use('/sass', express.static('sass'));
app.use('/fonts', express.static('fonts'));
app.use('/js', express.static('js'));
app.use('/images', express.static('images'));


// set app to use body parser to process/handle data tranfers
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// HOST ROUTE (HOME PAGE)
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html')
})

// FACEBOOK ROUTE (Webhook)
// We confirm if verify token is true
app.get('/webhook/', function(req, res) {
	if (req.query['hub.verify_token'] === token) {
		res.send(req.query['hub.challenge'])
	}
	res.send("Wrong verification!")
})

// We handle Message Deliveries To The Facebook Page
app.post('/webhook', function(req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i]
		let sender = event.sender.id

		if (event.message && event.message.text) {
			let text = event.message.text
			decideMessage(sender, text)
		}
        
		if(event.postback) {
			let text = JSON.stringify(event.postback)
			decideMessage(sender, text)
			continue
		}
	}
	res.sendStatus(200)
})


  /**************
  Interactions 
  **************/

// Define  Entities
function decideMessage(sender, text1) {
	let text = text1.toLowerCase()
  var about = [ "about", "us", "about code to create", "what is code to create"]
  var menu = [ "menu", "links", "task", "show me your menu", "teach me coding", "learn coding", "programming" ]
  var love = [ "I love you", "love", "i like you", "like"]
  var intro = [ "my name is ", "i am and you", "what is your name?", "your name", "tell me your name", "know you"]
  var time = ["what time is it?", "time", "what's the time", "what is the date?", "what is the time", "show time", "tell me the time", "date", "time now", "current time and date"]
  var creator = ["who created you?", "who made you", "who is your daddy", "who's your father", "your master", "made you", " who is tony letus"]
  var greetings = ["good morning", "goodmorning", "gud", "hi", "hello", "wassup", "xup", "hy", "what's up", "good evening", "good afternoon", "good day"]
  var joke = ["joke", "tell me some joke", "crack joke", "joke me", "make me laugh"]
  var farewell = ["bye", "see you later", "farewell", "take care", "terminate"]
  var humour = ["hahaha", "hahahaha", "haha", "funny", "hehehe", "hehehehe", "hehe", "lol", "lols", "lmao"]
  var niceThings = ["wow", "thank you", "thanks", "cool", "good", "welcome", "nice", "great", "jesus", "lovely"]
  var agreement = ["yes", "really", "yeah", "okay", "ofcourse", "definitely", "right", "ok", "kkk"]
  var emotion = ["sad", "angry", "sorrow", "pain", "hurt", "mourn", "horrible", "sadness", "sorrowful", "painful"]

 // Some form of Intents 
 // Replies for each Entities
 // Conditions: Base on user's inputs
  if (about.some(el => text.includes(el))) {
      sendGenericMessage1(sender)
  }
   else if (menu.some(el => text.includes(el))) {
    sendGenericMessage2(sender)
  }
   else if (love.some(el => text.includes(el))) {
    sendText(sender, "Sweet, Thank You... smilez!!!")
   }
   else if (intro.some(el => text.includes(el))) {
    sendText(sender, "Hi dear! I am Teebot. I work as the chief client informant for code to create.")
    sendText(sender, "Good To See YOU... What Can I Do For YOU?")
  }
   else if  (time.some(el => text.includes(el))) {
    sendText(sender, "I've fetched you both the time and the date: " + Date())
  }
    else if  (creator.some(el => text.includes(el))) {
    sendText(sender, "Thanks for asking. I was carrassed for by Tony Cletus, My father.")
  }
   else if (greetings.some(el => text.includes(el))) {
    sendText(sender, "Hello my dear... How may I help you?")
    sendButtonMessage(sender, "You can begin with my latest menu about code to create.")
  } 
   else if (joke.some(el => text.includes(el))) {
     sendText(sender, "I know just one joke that might make you laugh, I hope it does.")
     sendImageMessage(sender)
   }
   else if (farewell.some(el => text.includes(el))) {
     sendText(sender, "Alright then, have a nice day. Thank You!")
   }
   else if (humour.some(el => text.includes(el))) {
     sendText(sender, "Hehehehehe... funny sensation right?")
   }
    else if (niceThings.some(el => text.includes(el))) {
     sendText(sender, "My pleasure!!!")
   }
   else if (agreement.some(el => text.includes(el))) {
     sendText(sender, "Yeah! Cool...")
   }
   else if (emotion.some(el => text.includes(el))){
    sendText(sender, "Oh! I'm so sorry. All is well. It's gonna be okay dear")
   }
  else {
    sendText(sender, "I didn't get that properly though. I am just some months old you know? Still learning some English.")
    sendButtonMessage(sender, "Want To Know About Code To Create? Check Out My Latest Menu.")
  }
}

// Text Message Form of response
function sendText(sender, text) {
	let messageData = {text: text}
	sendRequest(sender, messageData)
}

// Button Message Form of response (Base on Facebook JSON Data)
// We define our buttons and what actions they should take
// With the payload property, We point to entities. (in this case: 'about' & menu)
function sendButtonMessage(sender, text) {
	let messageData = {
	  "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text": text,
        "buttons":[
          {
            "type":"postback",
            "title":"About Code To Create",
            "payload":"about"
          },
          {
          	"type":"postback",
            "title":"Hot Links",
            "payload":"menu"
          }
        ]
      }
    }
  }
  sendRequest(sender, messageData)
}

// Image Message Form of response
// We specify the url of the image to send to the user
function sendImageMessage(sender) {
  let messageData = {
     "attachment":{
      "type":"image", 
      "payload":{
        "url":"https://lh3.googleusercontent.com/hJtOv9zhPjcIALs5uK8rU9_hXRIOusgn5jgdAM3aSsIVRUpwtQh235KaDBbqedtYwng=h900", 
      }
    }
  }
  sendRequest(sender, messageData)
}

// Note: senderGenericMessage1
// Facebook Generic Message form of response
// We define our values for (title, image_url, subtitle, buttons)
function sendGenericMessage1(sender) {
  let  messageData = { "attachment":{
      "type": "template",
      "payload":{
        "template_type": "generic",
        "elements": [
          {
            "title": "About Code To Create",
            "image_url": "https://www.tangischools.org/cms/lib/LA01001731/Centricity/Domain/5707/codeing%20teacher%20resources.png",
            "subtitle": "CTC is a platform created by my creator Tony Cletus to evangelize coding.",
            "buttons":[
              {
                "type": "web_url",
                "url": "https://bit.ly/CodeToCreate-videos",
                "title": "CTC YouTube"
              },
              {
                "type": "web_url",
                "url": "https://twitter.com/CodeToCreate_",
                "title": "CTC Twitter"
              },
              {
                "type": "web_url",
                "url": "https://www.instagram.com/codetocreate/",
                "title": "CTC Instagram"
              }
            ] 
          }

        ]
      }

    }
  }
  sendRequest(sender, messageData)
}

// Note: senderGenericMessage2
// Facebook Generic Message form of response
// We define our values for (title, image_url, subtitle, buttons)
function sendGenericMessage2(sender) {
  let  messageData = { "attachment":{
      "type": "template",
      "payload":{
        "template_type": "generic",
        "elements": [
          {
            "title": "Our Hot Links",
            "image_url": "http://devcodecamp.com/wp-content/uploads/2016/07/devCodeCamp-Learn-To-Code.jpg",
            "subtitle": "Code To Creaet - We Code,  We Create,  We Teach, We change the world",
            "buttons":[
              {
                "type": "web_url",
                "url": "https://www.youtube.com/playlist?list=PLdFOv7eH-BP3qyp5-VGwHhmL8fZTMceIu",
                "title": "Learn JavaScript"
              },
              {
                "type": "web_url",
                "url": "https://bit.ly/CodeToCreate-videos",
                "title": "Code With Us"
              },
              {
                "type": "web_url",
                "url": "https://secret-sea-83423.herokuapp.com/",
                "title": "About Teebot"
              }
            ] 
          }

        ]
      }

    }
  }
  sendRequest(sender, messageData)
}

//Post reference, user, user message process & fb access token
function sendRequest(sender, messageData){
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs: {access_token : access},
		method: "POST",
		json: {
			recipient: {id: sender},
			message: messageData, 
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error")
		}else if (response.body.error) {
			console.log("response body error")
		}
	})
}

//Ofcourse our app must now listen to whatever port on line 17
app.listen(app.get('port'), function() {
	console.log("running: port");
}) 
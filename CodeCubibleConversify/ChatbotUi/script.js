var messages = [];
var lastUserMessage = "";
var botMessage = "";
var botName = 'Chatbot';
var talking = true;

function chatbotResponse() {
    talking = true;
    botMessage = "I'm confused"; //the default message

    if (lastUserMessage.toLowerCase() === 'hi' || lastUserMessage.toLowerCase() === 'hello') {
        const hi = ['Hi', 'Howdy', 'Hello'];
        botMessage = hi[Math.floor(Math.random() * hi.length)];
    }

    if (lastUserMessage.toLowerCase() === 'name') {
        botMessage = 'My name is ' + botName;
    }
}

function createChatBubble(message, isUser) {
    const bubble = document.createElement('div');
    bubble.className = isUser ? 'user' : 'bot';
    bubble.textContent = isUser ? message : `${botName}: ${message}`;
    return bubble;
}

function newEntry() {
    if (document.getElementById("chatbox").value != "") {
        lastUserMessage = document.getElementById("chatbox").value;
        document.getElementById("chatbox").value = "";
        messages.push(lastUserMessage);
        
        const userBubble = createChatBubble(lastUserMessage, true);
        document.getElementById("chatborder").appendChild(userBubble);

        chatbotResponse();
        messages.push(botMessage);
        
        const botBubble = createChatBubble(botMessage, false);
        document.getElementById("chatborder").appendChild(botBubble);

        Speech(botMessage);

        // Scroll to the bottom of the chat
        const chatborder = document.getElementById("chatborder");
        chatborder.scrollTop = chatborder.scrollHeight;
    }
}

//text to Speech
function Speech(say) {
    if ('speechSynthesis' in window && talking) {
        var utterance = new SpeechSynthesisUtterance(say);
        speechSynthesis.speak(utterance);
    }
}

//runs the keypress() function when a key is pressed
document.onkeypress = keyPress;
//if the key pressed is 'enter' runs the function newEntry()
function keyPress(e) {
    var x = e || window.event;
    var key = (x.keyCode || x.which);
    if (key == 13 || key == 3) {
        //runs this function when enter is pressed
        newEntry();
    }
}

//clears the placeholder text in the chatbox
//this function is set to run when the users brings focus to the chatbox, by clicking on it
function placeHolder() {
    document.getElementById("chatbox").placeholder = "";
}
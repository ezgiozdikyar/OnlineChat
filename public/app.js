const chatForm=document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages');

var leaveChat = new Audio("chatLeaving.mp3");
var messageSound = new Audio("message.mp3");

//to send a message
socket.on('message',message=>{
    console.log(message);
    messageSound.play();
    outputMessage(message);
    chatMessages.scrollTop=chatMessages.scrollHeight;
})

chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    //to send the message to server side
    socket.emit('chatMessage',msg);
    //to clear the textbox
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//to display the message on the screen
function outputMessage(message){
    const div=document.createElement('div');
    div.innerText = message.username + " : " + message.text;
    document.querySelector('.chat-messages').appendChild(div);
}

//when somebody wants to leave the chat
document.getElementById('leave-btn').addEventListener('click', () => {
    leaveChat.play();
    const leaveRoom = confirm('Do you want to leave the chat?');
    if (leaveRoom) {
      window.location = '../index.html';
    }
});

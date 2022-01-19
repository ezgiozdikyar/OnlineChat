var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose");
const { CommandFailedEvent } = require("mongodb");

var MongoClient = require('mongodb').MongoClient;
const socketio = require('socket.io');
const app = express();
const server = require('http').createServer(app);
const io = socketio(server);

function formatMessage(username,text){
    return{
        username,text
    }
}

app.use(bodyParser.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:true
}))

server.listen(3000);
console.log("Listening on PORT 3000");

io.on('connection',(socket)=>{
    console.log("a user connected with id: "+ socket.id);
     //When a user joins the chat
    socket.emit('message',formatMessage('Admin','Welcome to chat!'));
    socket.broadcast.emit('message',formatMessage('Admin','A user has joined the chat.'));
    //When a user disconnects
    socket.on('disconnect',()=>{ 
        io.emit('message',formatMessage('Admin','A user has left the chat.'));
    })
    //When a user sends a message
    socket.on('chatMessage',(msg)=>{ 
        io.emit('message',formatMessage('user',msg));
    })
})

mongoose.connect('mongodb://localhost:27017/mydb',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;
//Connecting to database
MongoClient.connect("mongodb://localhost:27017/mydb", function(err, database) {
  if(err) throw err
});

db.on('error',()=>console.log("Error occured connecting to database"));
db.once('open',()=>console.log("Connected to database succesfully"));

app.post("/register",(req,res)=>{
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    // If the username exits
    db.collection('users').findOne({username : username}, function(err, doc){
        if(doc){
            console.log("This username is already taken!");
            res.json({
                status:"FAILED",
                message:"This username is already taken. Please go back and try again!",
            })
        } 
        else{
            console.log(username,email,password);
            var data = {
                "username": username,
                "email" : email,
                "password" : password
            }
            db.collection('users').insertOne(data,(err,collection)=>{
                if(err){
                    throw err;
                }
                console.log("User information inserted successfully");
                return res.redirect('index.html');
            });
        }
    });
});

app.post('/login',(req,res)=>{
    var username= req.body.username;
    var password=req.body.password;

    // If user exits, password and username are correct, then login is succesfull.
    db.collection('users').findOne({username : username, password : password}, function(err, doc){
        if(err) throw err;
        if(doc) {
            console.log("User found: " + username + ". Succesfull login");
            return res.redirect('chat.html');
        } 
        else{ //If username or password is wrong
            console.log("Invalid password or username!");
            res.json({
                status:"FAILED",
                message:"Invalid password or username! Please go back and try again"

            })
        }
    });
})

app.get("/",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('index.html');
});
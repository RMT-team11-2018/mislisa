const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const socketIO = require('socket.io');
const user = require('./models/user');
const {shuffle} = require('./controller/mislisina_memorija');
var publicPath = path.join(__dirname,'public');
var port = process.env.PORT || 3000;

//setovanje aplikacije
var app = express();
var server = http.createServer(app);
app.set('view engine','hbs');

app.use(express.static(publicPath));
app.use(bodyParser());
app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    secret: 'mislisa',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 1000
    }
}));


app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.render('game.hbs');
    } else {
        next();
    }    
};

app.get('/', sessionChecker, (req, res) => {
    res.render('index.hbs');
});
//Zakomentatisano za vreme testiranja
// app.get('/game',sessionChecker,(req,res)=>{
//     res.render('index.hbs',{
//         loginMessage:'Morate biti ulogovani'
//     });
// });

app.get('/game',(req,res)=>{
    res.render('game.hbs');
});

app.get('/:trash',(req,res)=>{
    res.redirect('/');
});

app.post('/login',(req,res)=>{
    user.findUserByNicknameAndPassword(req.body.nickname,req.body.password,(user)=>{
        if(user){
            req.session.user = user;
            res.redirect('/game');
        }else{
            res.render('index.hbs',{
                loginMessage:'Pogrešan nadimak ili šifra'
            });
        }
    });
});

app.post('/registration',(req,res)=>{
    var userObj = {
        nadimak: req.body.nickname,
        sifra: req.body.password,
        email: req.body.email,
        brojNivoa:0
    };
    user.createUser(userObj,(user,err)=>{
        if(err){
            res.render('index.hbs',{
                loginMessage:'Nadimak je zauzet'
            });
        }else{
            req.session.user = user;
            res.redirect('/game');
        }
    });
});
var io = socketIO(server);
var numberOfPlayers = 0;
var waitSocket;
var gameIO = io.of('/game');
gameIO.on('connection',(socket)=>{
    numberOfPlayers++;
    if(numberOfPlayers%2==1){
        waitSocket = socket;
    }else{
        var roomName = `${numberOfPlayers/2}`;
        waitSocket.join(roomName);
        socket.join(roomName);
        handleGame(waitSocket,socket,roomName);
    }
    socket.on('disconnect',()=>{
        //moras ovo napraviti!!!
        /*if(socket.id==waitSocket.id){
            waitSocket=null;
        }*/
    });
});

var handleGame = (fSocket,sSocket,roomName)=>{
    var numbers = shuffle(4);
    gameIO.to(roomName).emit('shuffledNumbers',numbers);
    fSocket.emit('firstMove',1);
    sSocket.emit('firstMove',0);
    fSocket.on('sendFieldID',(id)=>{
        fSocket.broadcast.to(roomName).emit('fieldID',id);
    });
    sSocket.on('sendFieldID',(id)=>{
        sSocket.broadcast.to(roomName).emit('fieldID',id);
    });
};

server.listen(port,()=>{
    console.log('Server je pokrenut');
});



const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const socketIO = require('socket.io');
const user = require('./models/user');
const {shuffle} = require('./controller/mislisina_memorija');
const {getExpressions} = require('./controller/mudra_pcela');

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
        expires: 30000
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
        res.render('index.hbs',{
            login:true
        });
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
    res.render('game.hbs',{
        login:false
    });
});

app.get('/profile/:id',(req,res)=>{
    if(req.params.id=='my')
        res.render('profile.hbs');
});

app.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/');
});

app.get('/:trash',(req,res)=>{
    res.redirect('/');
});

app.post('/login',(req,res)=>{
    user.findUserByNicknameAndPassword(req.body.nickname,req.body.password,(user)=>{
        if(user){
            req.session.user = user;;
            res.render('index.hbs',{
                login:true
            });
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
    //Mislisina memorija

    //OVO ODKOMENTARISI POSLE GOTOVOG TESTIRNJA!!!
    handleMislisinaMemorija(fSocket,sSocket,roomName,handleMudraPcela);
    //A OVO OBRISI
    //handleMudraPcela(fSocket,sSocket,roomName);
    //Mudra pcela
};

var handleMislisinaMemorija = (fSocket,sSocket,roomName,nextGame)=>{
    var numbers = shuffle(4);
    gameIO.to(roomName).emit('shuffledNumbersMM',numbers);
    fSocket.emit('firstMoveMM',1);
    sSocket.emit('firstMoveMM',0);
    fSocket.on('sendFieldIDMM',(id)=>{
        fSocket.broadcast.to(roomName).emit('fieldIDMM',id);
    });
    sSocket.on('sendFieldIDMM',(id)=>{
        sSocket.broadcast.to(roomName).emit('fieldIDMM',id);
    });
    fSocket.on('endMM',(result)=>{
        //cuvanje rezultata
        nextGame(fSocket,sSocket,roomName);
    });
    sSocket.on('endMM',(result)=>{
        //cuvanje rezultata
    });
};

var handleMudraPcela = (fSocket,sSocket,roomName)=>{
    var expressions = getExpressions(10);
    gameIO.to(roomName).emit('expressionsMP',expressions);
    // fSocket.emit('firstMoveMP',1);
    // sSocket.emit('firstMoveMP',0);
    fSocket.on('sendPositionMP',(position)=>{
        fSocket.broadcast.to(roomName).emit('positionMP',position);
    });
    sSocket.on('sendPositionMP',(position)=>{
        sSocket.broadcast.to(roomName).emit('positionMP',position);
    });
};

server.listen(port,()=>{
    console.log('Server je pokrenut');
});



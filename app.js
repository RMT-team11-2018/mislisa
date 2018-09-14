const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const socketIO = require('socket.io');
const user = require('./models/user');
const _ = require('lodash');
const { shuffle } = require('./controller/mislisina_memorija');
const { getExpressions } = require('./controller/mudra_pcela');
const { getRandom } = require('./controller/udari_pandu');
const { getRandomTime } = require('./controller/udari_pandu');
const { getRandomVagalica } = require('./controller/vagalica');

var publicPath = path.join(__dirname, 'public');
var port = process.env.PORT || 3000;

//setovanje aplikacij
var app = express();
var server = http.createServer(app);
app.set('view engine', 'hbs');

app.use(express.static(publicPath));
app.use(bodyParser());
app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    secret: 'mislisa',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 300000000
    }
}));


app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

var sessionChecker = (req, res, next) => {
    if (!req.session.user || !req.cookies.user_sid) {
        res.render('index.hbs', {
            login: false
        });
    } else {
        next();
    }
};

app.get('/', sessionChecker, (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.render('index.hbs',{
            login:true
        });
    }else{
        res.render('index.hbs',{
            login:false
        });
    }
});
//Zakomentatisano za vreme testiranja
// app.get('/game',sessionChecker,(req,res)=>{
//     res.render('index.hbs',{
//         loginMessage:'Morate biti ulogovani'
//     });
// });

app.get('/game', (req, res) => {
    if(req.session.user && req.cookies.user_sid) {
        res.render('game.hbs',{
            login:true
        });
    }
    else{
        res.redirect('/');
    }
});


app.post('/profile', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        var nadimak = req.body.nickname;
        user.findUserByNickname(nadimak, (user) => {
            if (!user) {
                res.render('index.hbs', {
                    login: true,
                    searchMessage: `Ne postoji igrač sa nadimkom ${nadimak}`
                });
            }
            else {
                res.render('profile.hbs', {
                    name: user.nadimak
                });
            }
        })
    }
});

app.get('/profile/:id', (req, res) => {
    //Kako ovo odraditi preko sessionChechera? Ne prikazuje mi brain.gif
    if (req.session.user && req.cookies.user_sid) {
        if (req.params.id == 'my') {
            res.render('profile.hbs', {
                name: req.session.user.nadimak
            });
        }
    } else {
        res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid){
        req.session.destroy();
    }
    res.redirect('/');
});

app.get('/:trash', (req, res) => {
    res.redirect('/');
});

app.post('/registration', (req, res) => {
    var userObj = {
        nadimak: req.body.nickname,
        sifra: req.body.password,
        email: req.body.email,
        brojNivoa: 0
    };
    user.createUser(userObj, (user, err) => {
        if (err) {
            res.render('index.hbs', {
                loginMessage: 'Nadimak je zauzet'
            });
        } else {
            req.session.user = user;
            res.redirect('/game');
        }
    });
});

app.post('/login', (req, res) => {
    user.findUserByNicknameAndPassword(req.body.nickname, req.body.password, (user) => {
        if (user) {
            req.session.user = user;
            res.render('index.hbs', {
                login: true
            });
        } else {
            res.render('index.hbs', {
                loginMessage: 'Pogrešan nadimak ili šifra'
            });
        }
    });
});

var io = socketIO(server);
var numberOfPlayers = 0;
var waitSocket;
var gameIO = io.of('/game');
gameIO.on('connection', (socket) => {
    numberOfPlayers++;
    if (numberOfPlayers % 2 == 1) {
        waitSocket = socket;
    } else {
        var roomName = `${numberOfPlayers / 2}`;
        waitSocket.join(roomName);
        socket.join(roomName);
        handleGame(waitSocket, socket, roomName);
    }
    socket.on('disconnect', () => {
        if (waitSocket != null && socket.id == waitSocket.id) {
            numberOfPlayers--;
            waitSocket = null;
        }
    });
});

var handleGame = (fSocket, sSocket, roomName) => {
    var roomInfo = {
        name:roomName,
        fNickname : '',
        sNickname : '',
        mislisinaMemorija : {
            fScore : null,
            sScore : null
        },
        mudraPcela : {
            fScore : null,
            sScore : null
        },
        udariPandu : {
            fScore : null,
            sScore : null
        },
        vagalica : {
            fScore : null,
            sScore : null
        }
    };
    var callHandle = _.after(2,()=>{
        handleMislisinaMemorija(fSocket,sSocket,roomInfo,handleMudraPcela);
    });
    //OVO ODKOMENTARISI POSLE GOTOVOG TESTIRNJA!!!
    //A OVO OBRISI
    //handleMudraPcela(fSocket,sSocket,roomName);
    //handleUdaraPandu(fSocket,sSocket,roomName);
    //handleVagalica(fSocket, sSocket, roomName);
    //handleMudraPcela(fSocket,sSocket,handleMudraPcela)
    gameIO.to(roomName).emit('sendNickname');
    fSocket.once('nickname',(n)=>{
        roomInfo.fNickname = n.nickname;
        callHandle();
    });
    sSocket.once('nickname',(n)=>{
        roomInfo.sNickname =n.nickname;
        callHandle();
    });
};

var handleMislisinaMemorija = (fSocket, sSocket, roomInfo, nextGame) => {
    var callHandle = _.after(2,()=>{
        nextGame(fSocket,sSocket,roomInfo,handleUdaraPandu);
    });
    var numbers = shuffle(4);
    gameIO.to(roomInfo.name).emit('shuffledNumbersMM', numbers);
    fSocket.emit('firstMoveMM', 1);
    sSocket.emit('firstMoveMM', 0);
    fSocket.on('sendFieldIDMM', (id) => {
        fSocket.broadcast.to(roomInfo.name).emit('fieldIDMM', id);
    });
    sSocket.on('sendFieldIDMM', (id) => {
        sSocket.broadcast.to(roomInfo.name).emit('fieldIDMM', id);
    });
    fSocket.on('endMM', (result) => {
        roomInfo.mislisinaMemorija.fScore = result;
        console.log('Mislisina memorija 1 '+result.result,result.numMoves);
        callHandle();
    });
    sSocket.on('endMM', (result) => {
        roomInfo.mislisinaMemorija.sScore = result;
        console.log('Mislisina memorija 2 '+result.result,result.numMoves);
        callHandle();
    });
};

var handleMudraPcela = (fSocket, sSocket, roomInfo, nextGame) => {
    var callHandle = _.after(2,()=>{
        nextGame(fSocket, sSocket, roomInfo, handleVagalica);
    });
    var expressions = getExpressions(10);
    gameIO.to(roomInfo.name).emit('expressionsMP', expressions);
    fSocket.on('sendPositionMP', (position) => {
        fSocket.broadcast.to(roomInfo.name).emit('positionMP', position);
    });
    sSocket.on('sendPositionMP', (position) => {
        sSocket.broadcast.to(roomInfo.name).emit('positionMP', position);
    });
    fSocket.on('endMP', (result) => {
        roomInfo.mudraPcela.fScore = result;
        console.log('Mudra pcela 1'+result.trueAnswers,+result.falseAnswers,+result.time);
        callHandle();
    });
    sSocket.on('endMP', (result) => {
        roomInfo.mudraPcela.sScore = result;
        console.log('Mudra pcela 2'+result.trueAnswers,+result.falseAnswers,+result.time);
        callHandle();
    });
};

var handleUdaraPandu = (fSocket, sSocket, roomInfo, nextGame) => {
    var callHandle = _.after(1,()=>{
        nextGame(fSocket, sSocket, roomInfo);
    });
    var createdAtF = 0;
    var createdAtS = 0;
    var clickedF = false;
    var clickedS = false;
    var scoreF = 0;
    var scoreS = 0;
    var lastHole = 0;
    var numOfStep = 20;
    var random = getRandom(lastHole);
    var randomTime = getRandomTime();
    var stepCounter = 0;
    fSocket.on('pandaUP', (stepClient) => {
        if (stepCounter === stepClient) {
            createdAtF = new Date().getTime();
            clickedF = true;
        }
    });
    sSocket.on('pandaUP', (stepClient) => {
        if (stepCounter === stepClient) {
            createdAtS = new Date().getTime();
            clickedS = true;
        }
    });
    var intervalUP = setInterval(() => {
        if (stepCounter === numOfStep) {
            gameIO.to(roomInfo.name).emit('endUP', { scoreF, scoreS });
            clearInterval(intervalUP);
            console.log('Panda: ',scoreF,scoreS);
            roomInfo.udariPandu.fScore = scoreF;
            roomInfo.udariPandu.sScore = scoreS;
            console.log(JSON.stringify(roomInfo));
            //Ovde vracam klijentima rezultat igara radi prikazivanja
            gameIO.to(roomInfo.name).emit('results',roomInfo);
            //callHandle();
        }
        random = getRandom(lastHole);
        randomTime = getRandomTime();
        lastHole = random;
        gameIO.to(roomInfo.name).emit('randomUP', { random, randomTime });
        stepCounter++;

        if (clickedF && clickedS) {
            if (createdAtF < createdAtS) {
                scoreF++;
                //fSocket.emit('winRoundUP');
            }

            else if (createdAtF > createdAtS) {
                scoreS++
                //sSocket.emit('winRoundUP');
            }
            else {
                scoreS += 0.5;
                scoreF += 0.5;
            }

        } else if (clickedF && !clickedS) {
            scoreF++;
            //fSocket.emit('winRoundUP');
        } else if (clickedS && !clickedF) {
            scoreS++;
            //sSocket.emit('winRoundUP');
        }
        clickedF = false;
        clickedS = false;
    }, randomTime + 600);
};

var handleVagalica = function (fSocket, sSocket, roomName) {
    var odabranaPolja = new Array(15);
    var izabranoPolje = 0;
    odabranaPolja.forEach(polje => {
        polje = 0;
    });
    console.log('presla je na vagalicu');
    var vagCount = 1;
    var intervalVagalica = setInterval(() => {
        if (vagCount == 15) {
            clearInterval(intervalVagalica);
        }
        var randomVagNumber = getRandomVagalica(vagCount);
        gameIO.to(roomName).emit('punjenjeKase', { randomVagNumber, vagCount });
        vagCount++;

    }, 800);
    fSocket.on('odabranoPolje', (brPolja) => {
        odabranaPolja[brPolja - 1] = 1;
        izabranoPolje = brPolja;
    });
    sSocket.on('odabranoPolje', (brPolja) => {
        odabranaPolja[brPolja - 1] = 1;
        izabranoPolje = brPolja;
    });

    for (var i = 1; i < 11; i++) {
        if (i % 2 !== 0) {
            console.log('treba da emituje fsoket');
            fSocket.emit('biranjeBrojeva', {i, odabranaPolja});
        } else {
            sSocket.emit('biranjeBrojeva', {i, odabranaPolja});
        }
        if (izabranoPolje !== 0){
            console.log('sada svima emituje sta je odabrano');
            gameIO.to(roomName).emit('prikazPolja', {i, odabranaPolja, izabranoPolje});
        }
    }

}
server.listen(port, () => {
    console.log('Server je pokrenut');
});



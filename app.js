const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const socketIO = require('socket.io');
const user = require('./models/user');
const { shuffle } = require('./controller/mislisina_memorija');
const { getExpressions } = require('./controller/mudra_pcela');
const { getRandom } = require('./controller/udari_pandu');
const { getRandomTime } = require('./controller/udari_pandu');
const { getRandomVagalica } = require('./controller/vagalica');

var publicPath = path.join(__dirname, 'public');
var port = process.env.PORT || 3000;

//setovanje aplikacije
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
        expires: 3000000
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
    res.render('index.hbs');
});
//Zakomentatisano za vreme testiranja
// app.get('/game',sessionChecker,(req,res)=>{
//     res.render('index.hbs',{
//         loginMessage:'Morate biti ulogovani'
//     });
// });

app.get('/game', (req, res) => {
    res.render('game.hbs', {
        login: false
    });
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
    req.session.destroy();
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
    //Mislisina memorija

    //OVO ODKOMENTARISI POSLE GOTOVOG TESTIRNJA!!!
    handleMislisinaMemorija(fSocket,sSocket,roomName,handleMudraPcela);
    //A OVO OBRISI
    //handleMudraPcela(fSocket,sSocket,roomName);
    //handleUdaraPandu(fSocket, sSocket, roomName);
    //handleVagalica(fSocket, sSocket, roomName);
    //handleMudraPcela(fSocket,sSocket,handleMudraPcela);
};

var handleMislisinaMemorija = (fSocket, sSocket, roomName, nextGame) => {
    var numbers = shuffle(4);
    gameIO.to(roomName).emit('shuffledNumbersMM', numbers);
    fSocket.emit('firstMoveMM', 1);
    sSocket.emit('firstMoveMM', 0);
    fSocket.on('sendFieldIDMM', (id) => {
        fSocket.broadcast.to(roomName).emit('fieldIDMM', id);
    });
    sSocket.on('sendFieldIDMM', (id) => {
        sSocket.broadcast.to(roomName).emit('fieldIDMM', id);
    });
    fSocket.on('endMM', (result) => {
        //cuvanje rezultata
        nextGame(fSocket, sSocket, roomName, handleUdaraPandu);
        //nextGame(fSocket,sSocket,roomName);
    });
    sSocket.on('endMM', (result) => {
        //cuvanje rezultata
    });
};

var handleMudraPcela = (fSocket, sSocket, roomName, nextGame) => {
    var expressions = getExpressions(10);
    gameIO.to(roomName).emit('expressionsMP', expressions);
    fSocket.on('sendPositionMP', (position) => {
        fSocket.broadcast.to(roomName).emit('positionMP', position);
    });
    sSocket.on('sendPositionMP', (position) => {
        sSocket.broadcast.to(roomName).emit('positionMP', position);
    });
    fSocket.on('endMP', (result) => {
        //cuvanje rezultata
        //Jovanove igre posle ovog :)
        nextGame(fSocket, sSocket, roomName, handleVagalica);
    });
    sSocket.on('endMP', (result) => {
        //cuvanje rezultata
    });
};

//Evo ga tvoj deo
var handleUdaraPandu = (fSocket, sSocket, roomName, nextGame) => {
    var lastHole = 0;
    var numOfStep = 19;
    var random = getRandom(lastHole);
    var randomTime = getRandomTime();
    var stepCounter = 0;

    var resultsF = new Array(20);
    var resultsS = new Array(20);
    var rezultatIgre = {};


    fSocket.on('pandaUP', (stepClient) => {
        resultsF[stepClient] = new Date().getTime();


    });
    sSocket.on('pandaUP', (stepClient) => {
        resultsS[stepClient] = new Date().getTime();


    });
    var intervalUP = setInterval(() => {
        if (stepCounter === numOfStep) {
            setTimeout(() => {
                rezultatIgre = izracunajRezultat(resultsF, resultsS);
                console.log(`Rezultat igraca1:${rezultatIgre.rezF}---Rezultat igraca2:${rezultatIgre.rezS}`);
                gameIO.to(roomName).emit('endUP');
                clearInterval(intervalUP);
            }, 2200);
        }
        random = getRandom(lastHole);
        randomTime = getRandomTime();
        lastHole = random;
        gameIO.to(roomName).emit('randomUP', { random, randomTime });
        stepCounter++;


    }, randomTime + 600);
};
//racunanje rezultata iz handleUdaraPandu
function izracunajRezultat(resF, resS) {
    rezF = 0;
    rezS = 0;
    for (var i = 0; i < 20; i++) {

        if (typeof resF[i] != "undefined" && typeof resS[i] != "undefined") {
            if (resF[i] < resS[i]) {
                rezF++;
            }
            else if (resF[i] > resS[i]) {
                rezS++;
            }
            else {
                rezS += 0.5;
                rezF += 0.5;
            }
        } else if (typeof resF[i] != "undefined" && typeof resS[i] == "undefined") {
            rezF++;
        } else if (typeof resF[i] == "undefined" && typeof resS[i] != "undefined") {
            rezS++;
        }
    }
    return { rezF, rezS };
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
            fSocket.emit('biranjeBrojeva', { i, odabranaPolja });
        } else {
            sSocket.emit('biranjeBrojeva', { i, odabranaPolja });
        }
        if (izabranoPolje !== 0) {
            console.log('sada svima emituje sta je odabrano');
            gameIO.to(roomName).emit('prikazPolja', { i, odabranaPolja, izabranoPolje });
        }
    }

}
server.listen(port, () => {
    console.log('Server je pokrenut');
});



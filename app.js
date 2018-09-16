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
            login:true,
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
            login:true,
            nickname:req.session.user.nadimak
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
        //handleUdaraPandu(fSocket,sSocket,roomInfo,handleVagalica);
        
    });
    //OVO ODKOMENTARISI POSLE GOTOVOG TESTIRNJA!!!
    //A OVO OBRISI
    //handleMudraPcela(fSocket,sSocket,roomName);
    //handleUdaraPandu(fSocket, sSocket, roomName);
    //handleVagalica(fSocket, sSocket, roomName);
    //handleMudraPcela(fSocket,sSocket,handleMudraPcela)
    gameIO.to(roomName).emit('sendNickname');
    fSocket.once('nickname',(n)=>{
        roomInfo.fNickname = n.nickname;
        console.log(n.nickname);
        callHandle();
    });
    sSocket.once('nickname',(n)=>{
        roomInfo.sNickname =n.nickname;
        console.log(n.nickname);
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
        console.log('udje u callHandluPanda za poziv vagalice');
        nextGame(fSocket, sSocket, roomInfo);
    });
    var createdAtF = 0;
    var createdAtS = 0;
    var clickedF = false;
    var clickedS = false;
    var scoreF = 0;
    var scoreS = 0;
    var lastHole = 0;
    var numOfStep = 19;
    var random = getRandom(lastHole);
    var randomTime = getRandomTime();
    var stepCounter = 0;
    var rezF=0;
    var rezS=0;
    var resultsF = new Array(20);
    var resultsS = new Array(20);


    fSocket.on('pandaUP', (stepClient) => {
        resultsF[stepClient] = new Date().getTime();


    });
    sSocket.on('pandaUP', (stepClient) => {
        resultsS[stepClient] = new Date().getTime();


    });
    var intervalUP = setInterval(() => {
        if (stepCounter === numOfStep) {
            setTimeout(()=>{
            gameIO.to(roomInfo.name).emit('endUP', { scoreF, scoreS });
            console.log('Panda: ',scoreF,scoreS);
            //AJDE MOLIM TE DODAJ VREDNOST OVOME POSTO NE MOGU DA POHVATAM STA TI JE REZULTAT
            roomInfo.udariPandu.fScore = rezF;
            roomInfo.udariPandu.sScore = rezS;
            console.log(JSON.stringify(roomInfo));
            //Ovde vracam klijentima rezultat igara radi prikazivanja
            //gameIO.to(roomInfo.name).emit('results',roomInfo);
            callHandle();
            clearInterval(intervalUP);
            },600);
            
        }else{
        random = getRandom(lastHole);
        randomTime = getRandomTime();
        lastHole = random;
        gameIO.to(roomInfo.name).emit('randomUP', { random, randomTime });
        stepCounter++;
        }

    }, randomTime + 600);
};
//racunanje rezultata iz handleUdaraPandu
function izracunajRezultat(resF, resS) {
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

};


var handleVagalica = function (fSocket, sSocket, roomInfo) {
    var callHandle = _.after(1,()=>{
        //nextGame(fSocket, sSocket, roomInfo);
    });
    var randomVagNumbers = getRandomVagalica();
    console.log("udje u handle vagalicu");
    gameIO.to(roomInfo.name).emit('punjenjeKase',randomVagNumbers);
    fSocket.emit('firstMoveV', 1);
    sSocket.emit('firstMoveV', 0);

    fSocket.on('posaljiIDPoljaV', (i,brPoteza) => {
        fSocket.broadcast.to(roomInfo.name).emit('otvorenoPoljeID', i,brPoteza++);
    });
    sSocket.on('posaljiIDPoljaV', (i,brPoteza) => {
        sSocket.broadcast.to(roomInfo.name).emit('otvorenoPoljeID', i,brPoteza++);
    });
    fSocket.on('poljeKorpeOtvoreno', (i,brPoteza,trenutniRezultat) => {
        fSocket.broadcast.to(roomInfo.name).emit('otvorenoPoljeKorpeID', i,brPoteza++,trenutniRezultat);
    });
    sSocket.on('poljeKorpeOtvoreno', (i,brPoteza,trenutniRezultat) => {
        sSocket.broadcast.to(roomInfo.name).emit('otvorenoPoljeKorpeID', i,brPoteza++,trenutniRezultat);
    });

    fSocket.on('drugaFazaV', () => {
        gameIO.to(roomInfo.name).emit('novaFaza',Math.round(Math.random() * (120 - 80) + 80));
    });
    sSocket.on('drugaFazaV', () => {
        gameIO.to(roomInfo.name).emit('novaFaza',Math.round(Math.random() * (120 - 80) + 80));
    });
    fSocket.on('krajVagalice', () => {
        gameIO.to(roomInfo.name).emit('krajIgrice');
        console.log('Igrac1-20,Igrac2-0')
        roomInfo.vagalica.fScore=20;
        roomInfo.vagalica.sScore=0;
        gameIO.to(roomInfo.name).emit('results',roomInfo);
        //callHandle();
    });
    sSocket.on('drugaFazaV', () => {
        gameIO.to(roomInfo.name).emit('krajIgrice');
        console.log('Igrac1-0,Igrac2-20');
        roomInfo.vagalica.fScore=0;
        roomInfo.vagalica.sScore=20;
        gameIO.to(roomInfo.name).emit('results',roomInfo);
        //callHandle();
    });

}
server.listen(port, () => {
    console.log('Server je pokrenut');
});



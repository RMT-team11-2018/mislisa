const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const socketIO = require('socket.io');
const user = require('./models/user');
const game = require('./models/game');
const _ = require('lodash');
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
        expires: 300000000
    }
}));
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});
//Celo rutiranje se nalazi u routes.js fajlu
require('./routes')(app);

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
        name: roomName,
        fNickname: '',
        sNickname: '',
        mislisinaMemorija: {
            fScore: 0,
            sScore: 0
        },
        mudraPcela: {
            fScore: 0,
            sScore: 0
        },
        udariPandu: {
            fScore: 0,
            sScore: 0
        },
        vagalica: {
            fScore: 0,
            sScore: 0
        },
        fResult: 0,
        sResult: 0
    };
    var callHandle = _.after(2, () => {
        handleMislisinaMemorija(fSocket, sSocket, roomInfo, handleMudraPcela);
        //handleUdaraPandu(fSocket,sSocket,roomInfo,handleVagalica);

    });
    //OVO ODKOMENTARISI POSLE GOTOVOG TESTIRNJA!!!
    //A OVO OBRISI
    //handleMudraPcela(fSocket,sSocket,roomName);
    //handleUdaraPandu(fSocket, sSocket, roomName);
    //handleVagalica(fSocket, sSocket, roomName);
    //handleMudraPcela(fSocket,sSocket,handleMudraPcela)
    gameIO.to(roomName).emit('sendNickname');
    fSocket.once('nickname', (n) => {
        roomInfo.fNickname = n.nickname;
        callHandle();
    });
    sSocket.once('nickname', (n) => {
        roomInfo.sNickname = n.nickname;
        callHandle();
    });
};

var handleMislisinaMemorija = (fSocket, sSocket, roomInfo, nextGame) => {
    var callHandle = _.after(2, () => {
        nextGame(fSocket, sSocket, roomInfo, handleUdaraPandu);
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
        callHandle();
    });
    sSocket.on('endMM', (result) => {
        roomInfo.mislisinaMemorija.sScore = result;
        callHandle();
    });
};

var handleMudraPcela = (fSocket, sSocket, roomInfo, nextGame) => {
    var callHandle = _.after(2, () => {
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
        callHandle();
    });
    sSocket.on('endMP', (result) => {
        roomInfo.mudraPcela.sScore = result;
        callHandle();
    });
};

var handleUdaraPandu = (fSocket, sSocket, roomInfo, nextGame) => {
    var callHandle = _.after(1, () => {
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
    var rezF = 0;
    var rezS = 0;
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
            setTimeout(() => {
                for (var i = 0; i < 20; i++) {

                    if (typeof resultsF[i] != "undefined" && typeof resultsS[i] != "undefined") {
                        if (resultsF[i] < resultsS[i]) {
                            rezF++;
                        }
                        else if (resultsF[i] > resultsS[i]) {
                            rezS++;
                        }
                        else {
                            rezS += 0.5;
                            rezF += 0.5;
                        }
                    } else if (typeof resultsF[i] != "undefined" && typeof resultsS[i] == "undefined") {
                        rezF++;
                    } else if (typeof resultsF[i] == "undefined" && typeof resultsS[i] != "undefined") {
                        rezS++;
                    }
                }

                gameIO.to(roomInfo.name).emit('endUP', { scoreF, scoreS });
                console.log('Panda: ', scoreF, scoreS);
                roomInfo.udariPandu.fScore = rezF;
                roomInfo.udariPandu.sScore = rezS;
                callHandle();
                clearInterval(intervalUP);
            }, 600);

        } else {
            random = getRandom(lastHole);
            randomTime = getRandomTime();
            lastHole = random;
            gameIO.to(roomInfo.name).emit('randomUP', { random, randomTime });
            stepCounter++;
        }

    }, randomTime + 600);
};



var handleVagalica = function(fSocket, sSocket, roomInfo) {
    var callHandle = _.after(1, () => {
        handleEndGame(roomInfo);
        //nextGame(fSocket, sSocket, roomInfo);
    });
    var randomVagNumbers = getRandomVagalica();
    console.log("udje u handle vagalicu");
    gameIO.to(roomInfo.name).emit('punjenjeKase', randomVagNumbers);
    fSocket.emit('firstMoveV', 1);
    sSocket.emit('firstMoveV', 0);

    fSocket.on('posaljiIDPoljaV', (i, brPoteza) => {
        fSocket.broadcast.to(roomInfo.name).emit('otvorenoPoljeID', i, brPoteza++);
    });
    sSocket.on('posaljiIDPoljaV', (i, brPoteza) => {
        sSocket.broadcast.to(roomInfo.name).emit('otvorenoPoljeID', i, brPoteza++);
    });
    fSocket.on('poljeKorpeOtvoreno', (i, brPoteza, trenutniRezultat) => {
        fSocket.broadcast.to(roomInfo.name).emit('otvorenoPoljeKorpeID', i, brPoteza++, trenutniRezultat);
    });
    sSocket.on('poljeKorpeOtvoreno', (i, brPoteza, trenutniRezultat) => {
        sSocket.broadcast.to(roomInfo.name).emit('otvorenoPoljeKorpeID', i, brPoteza++, trenutniRezultat);
    });

    fSocket.on('drugaFazaV', () => {
        gameIO.to(roomInfo.name).emit('novaFaza', Math.round(Math.random() * (120 - 80) + 80));
    });
    sSocket.on('drugaFazaV', () => {
        gameIO.to(roomInfo.name).emit('novaFaza', Math.round(Math.random() * (120 - 80) + 80));
    });
    fSocket.on('krajVagalice', () => {
        gameIO.to(roomInfo.name).emit('krajIgrice');
        console.log('Igrac1-20,Igrac2-0')
        roomInfo.vagalica.fScore = 20;
        roomInfo.vagalica.sScore = 0;
        ////
        //Ovo nam je metoda u kojoj je logika za kraj igre, slanje klijentima,rad sa bazom itd...
        //handleEndGame(roomInfo);
        ////
        //gameIO.to(roomInfo.name).emit('results',roomInfo);
        callHandle();
    });
    sSocket.on('krajVagalice', () => {
        gameIO.to(roomInfo.name).emit('krajIgrice');
        console.log('Igrac1-0,Igrac2-20');
        roomInfo.vagalica.fScore = 0;
        roomInfo.vagalica.sScore = 20;
        ////
        //Ovo nam je metoda u kojoj je logika za kraj igre, slanje klijentima,rad sa bazom itd...
        //handleEndGame(roomInfo);
        ////
        //gameIO.to(roomInfo.name).emit('results', roomInfo);
        callHandle();
    });

}

var handleEndGame = (roomInfo) => {
    //result,numMoves
    var fmm = roomInfo.mislisinaMemorija.fScore;
    var smm = roomInfo.mislisinaMemorija.sScore;
    //trueAnswers,falseAnswers
    var fmp = roomInfo.mudraPcela.fScore;
    var smp = roomInfo.mudraPcela.sScore;

    var fup = roomInfo.udariPandu.fScore;
    var sup = roomInfo.udariPandu.sScore;

    var fv = roomInfo.vagalica.fScore;
    var sv = roomInfo.vagalica.sScore;

    roomInfo.mislisinaMemorija.fScore = Math.round(fmm.result * 90 / fmm.numMoves);
    roomInfo.mislisinaMemorija.sScore = Math.round(smm.result * 90 / smm.numMoves);
    roomInfo.mudraPcela.fScore = fmp.trueAnswers * 3 - 5 * fmp.falseAnswers;
    roomInfo.mudraPcela.sScore = smp.trueAnswers * 3 - 5 * smp.falseAnswers;
    //Ovo su tvoji rezultati...
    // roomInfo.udariPandu.fScore = 0;
    // roomInfo.udariPandu.sScore = 0;
    // roomInfo.vagalica.fScore = 0;
    // roomInfo.vagalica.sScore = 0;
    //
    roomInfo.fResult += roomInfo.mislisinaMemorija.fScore + roomInfo.mudraPcela.fScore + roomInfo.udariPandu.fScore + roomInfo.vagalica.fScore;
    roomInfo.sResult += roomInfo.mislisinaMemorija.sScore + roomInfo.mudraPcela.sScore + roomInfo.udariPandu.sScore + roomInfo.vagalica.sScore;

    console.log(JSON.stringify(roomInfo));
    gameIO.to(roomInfo.name).emit('results', roomInfo);

    var gameObj = {
        nadimak1: roomInfo.fNickname,
        nadimak2: roomInfo.sNickname,
        rezultat1: roomInfo.fResult,
        rezultat2: roomInfo.sResult
    }
    game.addGame(gameObj, (res) => {
        if (!res) {
            console.log('Greska prilikom cuvanja igre');
        }
    });
}
server.listen(port, () => {
    console.log('Server je pokrenut');
});



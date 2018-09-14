socket.once('sendNickname',function(){
    socket.emit('nickname',{
        nickname
    });
    console.log(nickname,' rarara');
});
socket.once('shuffledNumbersMM', function (shuffledNumbers) {
    numbers = numbers.concat(shuffledNumbers);
    socket.once('firstMoveMM', function (i) {
        if (i == 0) {
            numberOfMoves = 2;
        }
    });
    startMislisinaMemorija();
});

socket.once('expressionsMP', function (exps) {
    expressions = expressions.concat(exps);
    startMudraPcela();
});

//Udari pandu
socket.on('randomUP', function (randomP) {
    randomParams = randomP;
    startUdariPandu();
});

socket.on('endUP', (scores) => {
    ending(scores);
});

//Vagalica
socket.on('punjenjeKase', function (vagParams) {
    startVagalica(vagParams);
});
socket.on('biranjeBrojeva', function (biranjeParams) {
    biranjeIzKase(biranjeParams);
});
socket.on('prikazPolja',function(poljaZaPrikaz){
    prikazivanjePolja(poljaZaPrikaz);
});

//Primam rezultat
socket.once('results',function(results){
    displayResults(results);
});
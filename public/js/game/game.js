socket.on('shuffledNumbersMM', function (shuffledNumbers) {
    numbers = numbers.concat(shuffledNumbers);
    socket.on('firstMoveMM', function (i) {
        if (i == 0) {
            numberOfMoves = 2;
        }
    });
    startMislisinaMemorija();
});

socket.on('expressionsMP', function (exps) {
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
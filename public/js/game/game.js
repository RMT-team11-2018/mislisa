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
    
    startUdariPandu(randomP);
});

socket.on('endUP', (scores) => {
    document.getElementById('game').innerHTML = "";
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
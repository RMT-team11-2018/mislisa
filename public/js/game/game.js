socket.on('shuffledNumbersMM',function(shuffledNumbers){
    numbers = numbers.concat(shuffledNumbers);
    socket.on('firstMoveMM',function(i){
        if(i==0){
            numberOfMoves = 2;
        }
    });
    startMislisinaMemorija();
});

socket.on('expressionsMP',function(exps){
    expressions = expressions.concat(exps);
    startMudraPcela();
});
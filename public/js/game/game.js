socket.on('shuffledNumbers',function(shuffledNumbers){
    numbers = numbers.concat(shuffledNumbers);
    socket.on('firstMove',function(i){
        if(i==0){
            numberOfMoves = 2;
        }
    });
    console.log(numbers);
    startGame();
});
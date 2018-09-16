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
    
    startUdariPandu(randomP);
});

socket.on('endUP', (scores) => {
    document.getElementById('game').innerHTML = "";
});

//Vagalica
socket.on('punjenjeKase', function (vagParam) {
    console.log('Udje u punjenje kase');
    vagalicaNumbers=vagParam;
    socket.once('firstMoveV', function (i) {
        if (i == 0) {
            igracNaPotezu  = 1;
        }
    });
    startVagalica();
});

socket.on('novaFaza',(kasaRez)=>{
    rezultatKase=kasaRez;
    document.querySelector('.inpanel2').innerHTML="";
    var cnt="";
    cnt += `<div class="kasaPolje" id ="kp1">`;
    cnt += '</div>';
    cnt += `<div class="kasaPolje" id ="kp2">`;
    cnt += '</div>';
    document.querySelector('.inpanel2').innerHTML=cnt;
    // $('#kp1').css('top','0%');
    // $('#kp2').css('top','30%');
    $('#kp1').css('margin-left','100px');
    $('#kp1').css('margin-right','150px');
    $('#kp1').css('margin-bottom','50px');
    $('#kp1').css('margin-up','50px');
    $('#kp2').css('margin-left','100px');
    document.getElementById('kp1').textContent=rezultatKase;
    drugaFaza=1;
    
});

socket.on('krajIgrice',function(){
    document.querySelector('.inpanel2').innerHTML="";
    for(var i=1;i<11;i++){
        document.getElementById('pKorpe' + i).textContent="";
    }
});

//Primam rezultat
socket.once('results',function(results){
    displayResults(results);
});
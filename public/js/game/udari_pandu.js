var randomParams = {};
var countPanda = 0;
var lastPanda;
var game = document.getElementById('game');
function startUdariPandu(randomP) {
    if(countPanda !== 0 && lastPanda<19){
        $('#panda' + lastPanda).css("background-image", "url(../img/panda.jpg)");
    }
    lastPanda = randomP.random;
    randomParams=randomP;
    
    if (countPanda === 0) {
        game.innerHTML = "";
        $(document.body).css("background-color", "#024053");
        $(document.body).css("background-image", "url(../img/texture.png)");
        var content = '<div class="wrapper clearfix">';
        for (var i = 1; i < 10; i++) {
            content += '<div class="panel">'
            content += `<div class="hole" id="hole${i}">`;
            content += '</div>';
            content += `<div class="panda" id="panda${i}">`;
            content += '</div>';
            content += '</div>';
        }
        content += '</div>';
        game.innerHTML = content;

    }
    if(countPanda<20)
        panding();
}

function panding() {
    var pandaUPClick = document.querySelector('#panda' + randomParams.random);

    document.querySelector('#panda' + randomParams.random).style.top = -40 + '%';
    $("#panda" + randomParams.random).click(function () {
        console.log('Kliknuta panda sa rednim brojem-' + randomParams.random);
        socket.emit('pandaUP', countPanda);
        changesUP();
        // socket.on('winRoundUP', () => {
        //     changesUP();
        // });
    });

    setTimeout(() => {
        pandaUPClick.style.top = 100 + '%';
        countPanda++;
    }, randomParams.randomTime);
}

function ending(scores) {
    if (scores.scoreF > scores.scoreS)
        console.log('Winner is player 1');
    else if (scores.scoreF < scores.scoreS)
        console.log('Winner is player 2');
    game.innerHTML = "";
}
function changesUP() {
    // console.log('Doslo je do changes i ovo je random', randomParams.random);
    $('#panda' + randomParams.random).css("background-image", "url(../img/panda22.jpg)");
   
}
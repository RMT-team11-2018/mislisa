var korpe1 = 1;
var korpe2 = 6;
var vagalicaNumbers = [];
var igracNaPotezu = 0;
var otvorenaPolja = new Array(15);
var brojPoteza = 0;
var kraj = 0;
var drugaFaza = 0;
var otvorenaPoljaIgraca = new Array(10);
var otvorenaPoljaProtivnika= new Array(11);
var trenutniRezultat = 0;
var rezultatKase = 0;
otvorenaPolja.forEach(polje => {
    polje = false;
});
otvorenaPoljaIgraca.forEach(polje => {
    polje = false;
});
otvorenaPoljaProtivnika.forEach(polje => {
    polje = false;
});
var game = document.getElementById('game');

socket.on('otvorenoPoljeID', (i, brPoteza) => {
    if (igracNaPotezu == 1) {
        igracNaPotezu = 1 - igracNaPotezu;
        brojPoteza = brPoteza;
    }
    if (!otvorenaPolja[i])
        otvoriPoljeProtivnika(i, brojPoteza);
});
socket.on('otvorenoPoljeKorpeID', (i, brPoteza, trenRezultat) => {
    if (igracNaPotezu == 1)
        igracNaPotezu = 1 - igracNaPotezu;
    brojPoteza = brPoteza;
    trenutniRezultat = trenRezultat;
    otvoriPoljeKorpePrtovinika(i);
    otvorenaPoljaProtivnika[i+5]=true;
    if (trenutniRezultat > rezultatKase){
        console.log('usao je ovde');
        krajVagalice();
    }
        

});



function startVagalica() {
    var vagCount = 1;
    console.log('uspostavljna kom soketima');


    renderujStranicu();
    var interval = setInterval(() => {
        if (vagCount == 15)
            clearInterval(interval);
        napuniKasu(vagCount);
        vagCount++;
    }, 800);
}


function renderujStranicu() {
    game.innerHTML = "";
    var content = '<div class="wrapper clearfix">';
    content += '<div class="panel1">';
    content += '<div class="inpanel1">';
    content += '<div class="profil" id = "igrac1">';
    content += '</div>';
    content += '</div>';
    content += '<div class="inpanel2">';
    for (var i = 1; i < 16; i++) {
        content += `<div class="kasaPolje" onclick="potezVagalica(${i})" id ="kp${i}">`;
        content += '</div>';
    }
    content += '</div>';
    content += '<div class="inpanel1">';
    content += '<div class="profil" id="igrac2">';
    content += '</div>';
    content += '</div>';
    content += '</div>';
    content += '<div class="panel2">';

    content += '<div class="downpanel">';
    content += `<div class="korpa" id="korpa1">`;
    content += `<div class="nazivKorpe" id="nazivKorpe1">`;
    content += '<p>korpa</p>';
    content += '</div>';
    content += `<div class="poljaKorpe" id ="poljaKorpe1">`;
    for (var i = 1; i < 6; i++) {
        content += `<div class="pKorpe" onclick="otvoriPoljeKorpe(${i})" id ="pKorpe${i}">`;
        content += '</div>';
    }
    content += '</div>';
    content += '</div>';
    content += '</div>';

    content += '<div class="downpanel">';
    content += `<div class="korpa" id="korpa2">`;
    content += `<div class="nazivKorpe" id="nazivKorpe2">`;
    content += '<p>korpa</p>';
    content += '</div>';
    content += `<div class="poljaKorpe" onclick="otvoriPoljeKorpe(${i})" id ="poljaKorpe2">`;
    for (var i = 6; i < 11; i++) {
        content += `<div class="pKorpe" id ="pKorpe${i}">`;
        content += '</div>';
    }
    content += '</div>';
    content += '</div>';
    content += '</div>';

    content += '</div>';
    content += '</div>';
    game.innerHTML = content;
    $('.wrapper').css('background-color', '#22d676');
}


function napuniKasu(count) {
    document.getElementById('kp' + count).textContent = vagalicaNumbers[count - 1];
}

function potezVagalica(i) {
    if (otvorenaPolja[i]) {
        return;
    }

    if (igracNaPotezu == 0) {
        socket.emit('posaljiIDPoljaV', i, brojPoteza);
        otvoriPolje(i, brojPoteza);
        kraj += 2;
    }
}
function otvoriPolje(i, brojPoteza) {
    otvorenaPolja[i] = true;
    var brojZaUpis = document.getElementById('kp' + i).textContent;
    if (igracNaPotezu == 0) {
        if ((brojPoteza) % 2 == 0) {
            $('#kp' + i).css('background-color', '#c3fcdd');
            $('#kp' + i).css('color', '#056632');
            document.getElementById('pKorpe' + korpe1).textContent = brojZaUpis;
            korpe1++;
        } else {
            $('#kp' + i).css('background-color', '#c3fcdd');
            $('#kp' + i).css('color', '#056632');
            document.getElementById('pKorpe' + korpe2).textContent = brojZaUpis;
            korpe2++;
        }
    }
    igracNaPotezu = 1 - igracNaPotezu;
    promeniFazu();
};

function otvoriPoljeProtivnika(i, brojPoteza) {
    otvorenaPolja[i] = true;
    var brojZaUpis = document.getElementById('kp' + i).textContent;
    if (igracNaPotezu == 0) {
        if (brojPoteza % 2 != 0) {
            $('#kp' + i).css('background-color', '#c3fcdd');
            $('#kp' + i).css('color', '#056632');
            document.getElementById('pKorpe' + korpe1).textContent = brojZaUpis;
            korpe1++;
        } else {
            $('#kp' + i).css('background-color', '#c3fcdd');
            $('#kp' + i).css('color', '#056632');
            document.getElementById('pKorpe' + korpe2).textContent = brojZaUpis;
            korpe2++;
        }
    }
    promeniFazu();
};
function promeniFazu() {
    console.log('Udje ovde');
    console.log(kraj);
    if (kraj == 10) {
        kraj=0;
        otvorenaPolja.forEach(polje => {
            polje = true;
        });
        socket.emit('drugaFazaV');
    }
}



function otvoriPoljeKorpe(i) {

    if (drugaFaza == 0 || otvorenaPoljaIgraca[i] || igracNaPotezu == 1 || (brojPoteza % 2 == 0 && i > 5) || (brojPoteza % 2 != 0 && i < 6))
        return;
    otvorenaPoljaIgraca[i] = true;
    trenutniRezultat += Number(document.getElementById('pKorpe' + i).textContent);
    kraj+=2;
    socket.emit('poljeKorpeOtvoreno', i, brojPoteza, trenutniRezultat);
    $('#pKorpe' + i).css('background-color', '#056632');
    document.getElementById('kp2').textContent = trenutniRezultat;
    igracNaPotezu = 1 - igracNaPotezu;
    if (logickiKraj() || trenutniRezultat==rezultatKase)
        krajVagalice();

}
function otvoriPoljeKorpePrtovinika(i) {
    $('#pKorpe' + (i + 5)).css('background-color', '#056632');
    document.getElementById('kp2').textContent = trenutniRezultat;
}
function krajVagalice() {
    socket.emit('krajVagalice');
}
function logickiKraj() {
    
    for (var i = 6; i < 11; i++) {
        if (!otvorenaPoljaProtivnika[i]) {
            console.log('Ovo su protivnicki brojevi',Number(document.getElementById('pKorpe' + i).textContent));
            if (trenutniRezultat + Number(document.getElementById('pKorpe' + i).textContent) < rezultatKase){
                console.log('Usao je false za logicki kraj');
                return false;
            }
                
        }
    }
    console.log('dosao je do true za logicki kraj');
    return true;
}
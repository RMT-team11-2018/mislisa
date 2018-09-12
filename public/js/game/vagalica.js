var korpe1 = 1;
var korpe2 = 6;
var game = document.getElementById('game');
function startVagalica(vagParams) {
    console.log('uspostavljna kom soketima');
    console.log(vagParams.vagCount);
    if (vagParams.vagCount === 1) {
        game.innerHTML = "";
        var content = '<div class="wrapper clearfix">';
        content += '<div class="panel1">';
        content += '<div class="inpanel1">';
        content += '<div class="profil" id = "igrac1">';
        content += '</div>';
        content += '</div>';
        content += '<div class="inpanel2">';
        for (var i = 1; i < 16; i++) {
            content += `<div class="kasaPolje" id ="kp${i}">`;
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
            content += `<div class="pKorpe" id ="pKorpe${i}">`;
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
        content += `<div class="poljaKorpe" id ="poljaKorpe2">`;
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
        $(document.body).css("background-color", "#024053");
        $(document.body).css("background-image", "url(../img/texture.png)");
    }
    napuniKasu(vagParams);


}
function napuniKasu(vagParams) {
    document.getElementById('kp' + vagParams.vagCount).textContent = vagParams.randomVagNumber;
}
function biranjeIzKase(biranjeParams) {
    console.log('doslo je do biranja iz kase');
    for (var i = 1; i < 16; i++) {
        if (biranjeParams.odabranaPolja[i-1]===0) {
            $('#kp' + i).hover(function () {
                $(this).css("background-color", "#08351d");
            });
            $("#kp" + i).click(function () {
                console.log('Kliknuta polje kase' + randomParams.random);
                socket.emit('odabranoPolje', i);
            });
        }
    }

}

function prikazivanjePolja(poljaZaPrikaz) {
    var brojZaUpis = document.getElementById('kp' + poljaZaPrikaz.izabranoPolje).textContent;
    $('#kp' + poljaZaPrikaz.izabranoPolje).css('background-color', '#08351d');
    $('#kp' + poljaZaPrikaz.izabranoPolje).unbind('click');

    if (poljaZaPrikaz.i % 2 != 0) {
        document.getElementById('pKorpe' + korpe1).textContent = brojZaUpis;
        korpe1++;
    } else {
        document.getElementById('pKorpe' + korpe2).textContent = brojZaUpis;
        korpe2++;
    }


}
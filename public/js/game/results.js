function displayResults(results){
    game.style.display = "none";
    var resultsStr = JSON.stringify(results);
    console.log(results);
    var result = document.getElementById('result');
    result.style.display = "block";
    document.getElementById('fNickname').innerHTML = results.fNickname;
    document.getElementById('sNickname').innerHTML = results.sNickname;
    document.getElementById('fMislisinaMemorija').innerHTML = results.mislisinaMemorija.fScore;
    document.getElementById('sMislisinaMemorija').innerHTML = results.mislisinaMemorija.sScore;
    document.getElementById('fMudraPcela').innerHTML = results.mudraPcela.fScore;
    document.getElementById('sMudraPcela').innerHTML = results.mudraPcela.sScore;
    document.getElementById('fUdariPandu').innerHTML = results.udariPandu.fScore;
    document.getElementById('sUdariPandu').innerHTML = results.udariPandu.sScore;
    document.getElementById('fVagalica').innerHTML = results.vagalica.fScore;
    document.getElementById('sVagalica').innerHTML = results.vagalica.sScore;
    document.getElementById('fScore').innerHTML = result.fResult;
    document.getElementById('sScore').innerHTML = result.sResult;
};
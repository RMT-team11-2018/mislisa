function displayResults(results){
    game.style.display = "none";
    var resultsStr = JSON.stringify(results);
    console.log(results);
    var result = document.getElementById('result');
    result.style.display = "block";
    document.getElementById('fNickname').innerHTML = results.fNickname;
    document.getElementById('sNickname').innerHTML = results.sNickname;
    var fScore = 0;
    var sScore=0;
    var fmm = results.mislisinaMemorija.fScore;
    var smm = results.mislisinaMemorija.sScore;
    var fmp = results.mudraPcela.fScore;
    var smp = results.mudraPcela.sScore;
    var fup = results.udariPandu.fScore;
    var sup = results.udariPandu.sScore;

    fScore+=Math.round(fmm.result*90/fmm.numMoves);
    sScore+=Math.round(smm.result*90/smm.numMoves);
    document.getElementById('fMislisinaMemorija').innerHTML = Math.round(fmm.result*90/fmm.numMoves);
    document.getElementById('sMislisinaMemorija').innerHTML = Math.round(smm.result*90/smm.numMoves);
    fScore+=fmp.trueAnswers*3-5*fmp.falseAnswers;
    sScore+=smp.trueAnswers*3-5*smp.falseAnswers;
    document.getElementById('fMudraPcela').innerHTML = fmp.trueAnswers*3-5*fmp.falseAnswers;
    document.getElementById('sMudraPcela').innerHTML = smp.trueAnswers*3-5*smp.falseAnswers;
    fScore+=fup*3;
    sScore+=sup*3;
    document.getElementById('fUdariPandu').innerHTML = fup*3;
    document.getElementById('sUdariPandu').innerHTML = sup*3;

    document.getElementById('fScore').innerHTML = fScore;
    document.getElementById('sScore').innerHTML = sScore;
};
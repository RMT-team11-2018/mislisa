function displayResults(results){
    game.style.display = "none";
    var resultsStr = JSON.stringify(results);
    console.log(results);
    var result = document.getElementById('result');
    result.style.display = "block";
    document.getElementById('fNickname').innerHTML = results.fNickname;
    document.getElementById('sNickname').innerHTML = results.sNickname;
};
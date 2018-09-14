function displayResults(results){
    var resultsStr = JSON.stringify(results);
    game.innerHTML = '<p>' + resultsStr + '</p>';
};
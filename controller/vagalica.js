var getRandomVagalica = () => {
    var numbers = new Array(15);
    for (var i = 0; i < 15; i++) {
        if (i < 2) {
            numbers[i]=Math.round(Math.random() * (7 - 3) + 3);
        }
        else if (i >= 2 && i < 5) {
            numbers[i]=Math.round(Math.random() * (23 - 9) + 9);
        }
        else {
            numbers[i]=Math.round(Math.random() * (45 - 18) + 18);
        }
        
    }return numbers;
}
module.exports = { getRandomVagalica };
//Metoda getExpressions generise i vraca izraze koje treba poslati igracima


var getExpressions = (n)=>{
    //+ - / *
    var expressions = new Array(n);
    for(var i=0;i<n;i++){
        var firstSign = Math.floor(Math.random()*3);
        var secondSign = Math.floor(Math.random()*3);
        var firstNumber = Math.floor(Math.random()*10)+1;
        var secondNumber = Math.floor(Math.random()*10)+1;
        var thirdNumber = Math.floor(Math.random()*10)+1;
        var strExp = '';
        var result = 0;
        switch (firstSign){
            case 0:{
                strExp+=firstNumber + '+' + secondNumber;
                break;
            }
            case 1:{
                strExp+=firstNumber + '-' + secondNumber;
                break;
            }
            case 2:{
                strExp+=firstNumber + '*' + secondNumber;
                break;
            }
            case 3:{
                strExp+=firstNumber + '/' + secondNumber;
                break;
            }
        }
        switch(secondSign){
            case 0:{
                strExp+= '+' + thirdNumber;
                break;
            }
            case 1:{
                strExp+= '-' + thirdNumber;
                break;
            }
            case 2:{
                strExp+= '*' + thirdNumber;
                break;
            }
            case 3:{
    
                strExp+= '/' + thirdNumber;
                break;
            }
        }
        expressions[i] = strExp;
    }
    return expressions;
};

module.exports = {getExpressions};
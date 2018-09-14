var shuffle = (n)=>{
    var numOfFields = n*n;
    var numbers = new Array(numOfFields);
    var i,j,k,pom;
    var counter = 1;

    for(i=0;i<numOfFields;i+=2){
        numbers[i] = counter;
        numbers[i+1] = counter;
        counter++;
    }
    for(i=0;i<numOfFields;i++){
        k = Math.floor((Math.random() * numOfFields));
        pom = numbers[i];
        numbers[i] = numbers[k];
        numbers[k] = pom;
    }
    return numbers;
}

module.exports = {shuffle};
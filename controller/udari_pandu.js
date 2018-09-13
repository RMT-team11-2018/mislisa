var getRandom =(lastHole)=>{
    
    var hole= Math.floor(Math.random()*8 + 1);
    while(lastHole===hole){
        hole =Math.floor(Math.random()*8 + 1);
    }
    return hole;
};
var getRandomTime = ()=>{
    return Math.round(Math.random() * (1250 - 430) + 430);
}
module.exports={getRandom,getRandomTime};
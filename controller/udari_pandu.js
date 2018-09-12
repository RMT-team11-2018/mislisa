var getRandom =(lastHole)=>{
    
    var hole= Math.floor(Math.random()*8 + 1);
    while(lastHole===hole){
        hole =Math.floor(Math.random()*8 + 1);
    }
    return hole;
};
var getRandomTime = ()=>{
    return Math.round(Math.random() * (1200 - 500) + 500);
}
module.exports={getRandom,getRandomTime};
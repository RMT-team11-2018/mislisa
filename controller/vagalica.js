var getRandomVagalica = (vagCount)=>{
    if(vagCount<4){
    return Math.floor(Math.round(Math.random()*((vagCount+2)*4 - 7) + 2));
    }
    else if(vagCount>=4&&vagCount<10){
        return Math.floor(Math.round(Math.random()*((vagCount+1)*5 - 6) + 3));
    }
    else{
        return Math.floor(Math.round(Math.random()*vagCount*2+6));
    }
}
module.exports={getRandomVagalica};
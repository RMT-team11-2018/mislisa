const request = require('request');
var temp = (callback)=>{
    request({
        url:"http://api.worldweatheronline.com/premium/v1/weather.ashx?key=0d536cd7e031471e88e21353193101&q=Belgrade,Serbia&num_of_days=2&tp=3&format=json",
        json:true
    },(error,response,body)=>{
        var temp = body.data.current_condition[0].temp_C;
        if(temp<=0){
            callback('Temperatura je ispod nule!Predlažemo da uz igru pijete čaj.');
        }else if(temp>=0 && temp<=5){
            callback('Temperatura je malo preko nule!Predlažemo da uz igru pijete neki topao napitak.');
        }else if(temp>5 && temp<=10){
            callback('Napolju je malo hladnije vreme. Predlažemo da uz igru pijete neki napitak.');
        }else if(temp>10 && temp<=20){
            callback('Vreme je prijatno! Igru možes igrati sa uživanjem :)');
        }else{
            callback('Vreme je toplo! Osvežite se voćem :)');
        }

    });
}

module.exports = {temp}
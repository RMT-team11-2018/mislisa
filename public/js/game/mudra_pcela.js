var canvas;
var ctx;
var elemLeft;
var elemTop;

//Izrazi koje dobijamo od strane servera
var expressions = [];

//pozicija pcele
var x;
var y;

//pozicija protivnika
var xp;
var yp;

//broj redova(cvetova)
var numOfFlwRow = -1;
var expRes;
var trueAnswers = 0;
var falseAnswers = 0;
var time = 0;

//Strukture potrebne za igru
var bee_obj = {
    'source': null,
    'current': 0,
    'total_frames': 64,
    'width': 120,
    'height': 80,
    'fly':true,
    'wait':false,
    'flowerR':-1,
    'flowerC':-1
};
//Protivnik
var bee_obj_p = {
    'source': null,
    'current': 0,
    'total_frames': 64,
    'width': 120,
    'height': 80,
    'fly':true,
    'wait':false,
    'flowerR':-1,
    'flowerC':-1
};

function flw_obj(x,y,result){
    this.x = x,
    this.y = y,
    this.result= result,
    this.size=0;
};

function expression(str,result){
    this.str = str,
    this.result = result
};

var flowers = new Array(10);

var bee = new Image();
var flw = new Image();
bee.onload = function () {
    bee_obj.source = bee;
    bee_obj_p.source = bee;
}
bee.src = '../../img/bee.png';
flw.src = '../../img/flw.png';



function startMudraPcela(){
    game.innerHTML = '<canvas id="canvas" width="1000" height="700"></canvas>';
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    elemLeft = canvas.offsetLeft;
    elemTop = canvas.offsetTop;
    x = canvas.width/2-60;
    y = canvas.height-140;
    xp = canvas.width/2-60;
    yp = canvas.height-140;
    ctx.textAlign = "center";
    ctx.fillStyle="white";

    socket.on('positionMP',function(position){
        xp = position.x;
        yp = position.y;
    });

    canvas.addEventListener('click',function(event){
        var xc = event.pageX - elemLeft;
        var yc = event.pageY - elemTop;
        for(var i=0;i<4;i++){
            if(xc<flowers[numOfFlwRow][i].x+150 && xc>=flowers[numOfFlwRow][i].x && yc<flowers[numOfFlwRow][i].y+150 && yc>=flowers[numOfFlwRow][i].y){
                bee_obj.fly = true;
                bee_obj.wait = true;
                bee_obj.flowerR = numOfFlwRow;
                bee_obj.flowerC = i;
                if(flowers[numOfFlwRow][i].result==expRes){
                    trueAnswers++;
                }else{
                    falseAnswers++;
                }
                //change_expression(getExpression());
                break; 
            }
        }
    });

    change_expression(getExpression());

    var interval = setInterval((function () {
        //Slanje pozicije serveru
        socket.emit('sendPositionMP',{x,y});

        draw_anim();
        if(!bee_obj.wait)
            time+=30;
    }), 30);
}

function draw_anim() { 
    ctx.clearRect(0,60,1000,700);
    if(numOfFlwRow==10){
        draw_end_score();
        clearInterval(interval);
    }else{
        if(flowers[numOfFlwRow][0].y>450){
            change_expression(getExpression());
            console.log("sad");
        }
        draw_flowers();
        draw_bee();
    }
}

function change_expression(exp){
    let position = 200;
    var tp = Math.floor(Math.random()*4);
    expRes = exp.result;
    flowers[++numOfFlwRow] = new Array(4);

    for(var i=0;i<4;i++){
        var randNum = i==tp?exp.result:exp.result-Math.floor(Math.random()*10)+5;
        if(i==0)
            flowers[numOfFlwRow][i] = new flw_obj(position,135,randNum);
        else
            flowers[numOfFlwRow][i] = new flw_obj(position,135+(Math.random()*100),randNum);
        position+=200;
    }
    bee_obj.wait = false;
    ctx.clearRect(200,0,1000,100);
    ctx.fillStyle = "white";
    ctx.font = "30px arial";
    ctx.fillText(exp.str,canvas.width/2,45);
    
}
function draw_flowers(){
    for(var i=0;i<=numOfFlwRow;i++){
        for(var j=0;j<4;j++){
            ctx.drawImage(flw,flowers[i][j].x,flowers[i][j].y++,flowers[i][j].size,flowers[i][j].size);
            if(flowers[i][j].size<150)
                changeFlowerSize(flowers[i][j]);
        }
        draw_results();
    }
}
function draw_end_score(){
    ctx.fillStyle = "white";
    ctx.font = "50px arial";
    ctx.fillText("Rezultat:",canvas.width/2,250);
    ctx.fillText("-T:"+trueAnswers,canvas.width/2,300);
    ctx.fillText("-F:"+falseAnswers,canvas.width/2,350);
    ctx.fillText("-Vreme:"+time,canvas.width/2,400);
}

function draw_results(){
    for(var i=0;i<4;i++){
        var flw = flowers[numOfFlwRow][i];
        ctx.font = "20px arial";
        ctx.fillText(flw.result+'',flw.x+flw.size/2,flw.y+flw.size/2+5);
    }
}

function draw_bee(){
    ctx.drawImage(bee_obj_p.source, bee_obj_p.current * bee_obj_p.width, 0,bee_obj_p.width, bee_obj_p.height,xp, yp, bee_obj_p.width, bee_obj_p.height);
    bee_obj_p.current = (bee_obj_p.current + 1) % bee_obj_p.total_frames;
    if(bee_obj.fly){
        ctx.drawImage(bee_obj.source, bee_obj.current * bee_obj.width, 0,bee_obj.width, bee_obj.height,x, y, bee_obj.width, bee_obj.height);
        bee_obj.current = (bee_obj.current + 1) % bee_obj.total_frames;
        if(bee_obj.flowerR>=0){
            var xl = Math.abs(x-flowers[bee_obj.flowerR][bee_obj.flowerC].x)+15;
            var yl = Math.abs(y-flowers[bee_obj.flowerR][bee_obj.flowerC].y)+35;
            if(bee_obj.flower!=-1){
                if(xl<100 && yl<100){
                    bee_obj.fly = false;
                }
                else{
                    if(x-flowers[bee_obj.flowerR][bee_obj.flowerC].x>15){
                        x-=10;
                    }else{
                        x+=10;
                    }
                    if(y-flowers[bee_obj.flowerR][bee_obj.flowerC].y>35){
                        y-=(yl/xl)*10;
                    }else{
                        y+=(yl/xl)*10;
                    }
                }
            }
        }
    }else{
        ctx.drawImage(bee_obj.source, 5*bee_obj.width, 0,bee_obj.width, bee_obj.height,x, y, bee_obj.width, bee_obj.height);
        x = flowers[bee_obj.flowerR][bee_obj.flowerC].x+15;
        y = flowers[bee_obj.flowerR][bee_obj.flowerC].y+35;
    }
}

function changeFlowerSize(flw){
    flw.size+=10;
    flw.x-=5;
    flw.y-=5;
}

function getExpression(){
    return new expression(expressions[numOfFlwRow+1],eval(expressions[numOfFlwRow+1]));
}
//Ne moze biti neparan broj zbog neparnog broja polja!!!
var n = 4;
var width = Math.floor(12/n);
var fields = new Array(n);
var fieldsObj = new Array(n);
var numbers = [];
var numberOfMoves = 0;
var oppNumberOfMoves = 0;
var firstMove = '';
var secondMove = '';
var numMoves = 0;
var numFined = 0;
//global
var game = document.getElementById('game');

socket.on('fieldIDMM',function(id){
    oppNumberOfMoves++;
    if(oppNumberOfMoves==2){
        numberOfMoves = 0;
        oppNumberOfMoves = 0;
    }
    move(id,returnField(id));
});

function Field(id,img,fined,opened){
    this.id = id;
    this.img = img;
    this.opened = opened;
    this.fined = fined;
}

function startMislisinaMemorija(){
    var i,j;
    var counter = 0;
    var content = '';
    for(i=0;i<n;i++){
        fields[i] = new Array(n);
        content+='<div class="row">';
        for(j=0;j<n;j++){
            fields[i][j] = new Field(counter,'',false,false);
            content+='<div onclick="handleMove(id)" class="field" id="'+i+''+j+'">';
            content+='</div>';
            counter++;
        }
        content+='</div>'
    }
    game.innerHTML = content;
    shuffle();
}

function shuffle(){
    var counter = 0;
    var i,j;
    for(i=0;i<n;i++){
        for(j=0;j<n;j++){
            fields[i][j].img = numbers[counter];
            counter++;
        }
    }
}

function returnField(id){
    var i = parseInt(id.charAt(0));
    var j = parseInt(id.charAt(1));
    return fields[i][j];
}

function handleMove(id){
    var tmp = returnField(id);
    if(tmp.opened)
        return;
    if(numberOfMoves<2){
        numberOfMoves++;
        socket.emit('sendFieldIDMM',id);
        move(id,tmp);
    }
}

function move(id,tmp){
    if(numMoves%2==0){
        firstMove = id;
        refesh();
    }
    else
        secondMove = id;
    numMoves++;
    changeColor(id);
    tmp.opened = true;
    if(numMoves%2==0){
        firstField = returnField(firstMove);
        secondField = returnField(secondMove);
        if(firstField.img==secondField.img){
            firstField.fined = true;
            secondField.fined = true;
            numFined+=2;
        }
    }
    theEnd();
}

function changeColor(id){
    var i = parseInt(id.charAt(0));
    var j = parseInt(id.charAt(1));
    document.getElementById(id).style.background = "white";
    document.getElementById(id).innerHTML = '<img id="img" src="img/'+fields[i][j].img+'.gif">';
}

function refesh(){
    var i,j;
    for(i=0;i<n;i++){
        for(j=0;j<n;j++){
            if(fields[i][j].fined==false){
                fields[i][j].opened = false;
                document.getElementById(i+''+j).style.background = "grey";
                document.getElementById(i+''+j).innerHTML='';
            }
        }
    }
}

function theEnd(){
    if(numFined==n*n){
        //Ovde trebam da posaljem rezultat
        socket.emit('endMM',null);
        game.innerHTML = "";
    }
}
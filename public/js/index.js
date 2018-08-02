var reg = document.getElementById('registration_window');
var des = document.getElementById('description_window');


var reg_btn = document.getElementById("reg_btn");
var des_btn = document.getElementById("des_btn");


//ovde voditi racuna o redosledu u html dokumentu
var reg_span = document.getElementsByClassName("close")[0];
var des_span = document.getElementsByClassName("close")[1];

reg_btn.onclick = function() {
    reg.style.display = "block";
}
des_btn.onclick = function(){
    des.style.display = "block";
}

reg_span.onclick = function() {
    reg.style.display = "none";
}
des_span.onclick = function(){
    des.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == reg) {
        reg.style.display = "none";
    }else if(event.target == des){
        des.style.display = "none";
    }
}
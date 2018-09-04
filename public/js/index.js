var reg = document.getElementById('registration_window');
var des = document.getElementById('description_window');
var search = document.getElementById('search_window');

var reg_btn = document.getElementById("reg_btn");
var des_btn = document.getElementById("des_btn");
var game_btn = document.getElementById("game_btn");
var logout_btn = document.getElementById("logout_btn");
var profile_btn = document.getElementById('profile_btn');
var search_btn = document.getElementById('search_btn');
//ovde voditi racuna o redosledu u html dokumentu
var reg_span = document.getElementsByClassName("close")[0];
var des_span = document.getElementsByClassName("close")[1];
var search_span = document.getElementsByClassName("close")[2];
if(game_btn){
    game_btn.onclick = function () {
        location.href = "/game";
    };
}
if(logout_btn){
    logout_btn.onclick = function(){
        location.href = "/logout";
    };
}
if(profile_btn){
    profile_btn.onclick = function(){
        location.href = "/profile/my"
    };
}
if(search_btn){
    search_btn.onclick = function(){
        search.style.display = "block";
    }
}
if(reg_btn){
    reg_btn.onclick = function() {
        reg.style.display = "block";
    }
}
if(des_btn){
    des_btn.onclick = function(){
        des.style.display = "block";
    }
}


reg_span.onclick = function() {
    reg.style.display = "none";
}
des_span.onclick = function(){
    des.style.display = "none";
}
search_span.onclick = function(){
    search.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == reg) {
        reg.style.display = "none";
    }else if(event.target == des){
        des.style.display = "none";
    }else if(event.target == search){
        search.style.display = "none";
    }
}
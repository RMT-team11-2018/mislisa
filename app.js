const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const user = require('./models/user');

var publicPath = path.join(__dirname,'public');
var port = process.env.PORT || 3000;

//setovanje aplikacije
var app = express();
app.set('view engine','hbs');

app.use(express.static(publicPath));
app.use(bodyParser());

app.get('/',(req,res)=>{
    res.render('index.hbs');
});

app.get('/game',(req,res)=>{
    res.render('game.hbs');
});

app.post('/registration',(req,res)=>{
    var userObj = {
        nadimak: req.body.nickname,
        sifra: req.body.password,
        email: req.body.email,
        brojNivoa:0
    }
    user.createUser(userObj);
    res.end();
});

app.post('/login',(req,res)=>{
    user.findUserByNicknameAndPassword(req.body.nickname,req.body.password,(user)=>{
        if(user){
            res.redirect('game');
        }else{
            res.redirect('/');
        }
    });
});


app.listen(port,()=>{
    console.log('Server je pokrenut');
});



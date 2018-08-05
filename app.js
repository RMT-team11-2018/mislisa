const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const user = require('./models/user');

var publicPath = path.join(__dirname,'public');
var port = process.env.PORT || 3000;

//setovanje aplikacije
var app = express();
app.set('view engine','hbs');

app.use(express.static(publicPath));
app.use(bodyParser());
app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    secret: 'mislisa',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 1000
    }
}));
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.render('game.hbs');
    } else {
        next();
    }    
};

app.get('/', sessionChecker, (req, res) => {
    res.render('index.hbs');
});

app.get('/game',sessionChecker,(req,res)=>{
    res.render('index.hbs',{
        loginMessage:'Morate biti ulogovani'
    });
});

app.get('/:trash',(req,res)=>{
    res.redirect('/');
});

app.post('/login',(req,res)=>{
    user.findUserByNicknameAndPassword(req.body.nickname,req.body.password,(user)=>{
        if(user){
            req.session.user = user;
            res.redirect('/game');
        }else{
            res.render('index.hbs',{
                loginMessage:'Pogrešan nadimak ili šifra'
            });
        }
    });
});

app.post('/registration',(req,res)=>{
    var userObj = {
        nadimak: req.body.nickname,
        sifra: req.body.password,
        email: req.body.email,
        brojNivoa:0
    };
    user.createUser(userObj,(user,err)=>{
        if(err){
            res.render('index.hbs',{
                loginMessage:'Nadimak je zauzet'
            });
        }else{
            req.session.user = user;
            res.redirect('/game');
        }
    });
});

app.listen(port,()=>{
    console.log('Server je pokrenut');
});



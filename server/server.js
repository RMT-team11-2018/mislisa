const express = require('express');
const path = require('path');
const db = require('./db/db');


var publicPath = path.join(__dirname,'/../public');
var port = process.env.PORT || 3000;

//setovanje aplikacije
var app = express();
app.set('view engine','hbs');
app.set('views',publicPath)

app.use(express.static(publicPath));


app.get('/',(req,res)=>{
    res.render('index.hbs');
});

app.listen(port,()=>{
    console.log('Server je pokrenut');
});



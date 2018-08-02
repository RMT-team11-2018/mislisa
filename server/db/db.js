//CLEARDB_DATABASE_URL: mysql://b8dbabab71441c:5cd93135@eu-cdbr-west-02.cleardb.net/heroku_25ef53da1483b28?reconnect=true
const mysql = require('mysql');
var connection = mysql.createConnection({
    host:'eu-cdbr-west-02.cleardb.net',
    user:'b8dbabab71441c',
    password:'5cd93135',
    database:'heroku_25ef53da1483b28'
});

connection.connect((err)=>{
    if(err){
        console.log('Greska prilikom povezivanja sa bazom podataka', err.stack);
    }else{
        console.log('Povezivanje sa bazom podataka je uspesno: ',connection.threadId);
    }
});


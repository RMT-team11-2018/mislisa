const pool = require('./pool');
const sqlstring = require('sqlstring');

var addGame = (game,callback)=>{
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        connection.query(sqlstring.format('INSERT INTO igre SET ?',game),(error,result,fields)=>{
            connection.release();
            if(error){
                callback(undefined,error);
            }else{
                callback(user);
            }

        });
    });
}
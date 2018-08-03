const pool = require('./pool');
const sqlstring = require('sqlstring');

var createUser = (user)=>{
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        connection.query(sqlstring.format('INSERT INTO igraci SET ?',user),(error,result,fields)=>{
            console.log(result);
            connection.release();
            if(error) throw error;
        });
    });
};

var findUserByNicknameAndPassword = (nickname,password,callback)=>{
    var user;
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        var res = connection.query(sqlstring.format('SELECT * FROM igraci WHERE nadimak=? AND sifra=?',[nickname,password]),(error,result,fields)=>{
            connection.release();
            if(error) throw error;
            else if(result){
                callback(result[0]);
            }
        });
    });
};

module.exports = {createUser,findUserByNicknameAndPassword};
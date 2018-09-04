const pool = require('./pool');
const sqlstring = require('sqlstring');

var createUser = (user,callback)=>{
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        connection.query(sqlstring.format('INSERT INTO igraci SET ?',user),(error,result,fields)=>{
            connection.release();
            if(error){
                callback(undefined,error);
            }else{
                callback(user);
            }

        });
    });
};

var findUserByNickname = (nickname,callback)=>{
    var user;
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        var res = connection.query(sqlstring.format('SELECT * FROM igraci WHERE nadimak=?',[nickname]),(error,result,fields)=>{
            connection.release();
            if(error) throw error;
            else if(result){
                var obj = {};
                for(var key in result[0]){
                    obj[key] = result[0][key];
                }
                if(Object.keys(obj).length>0){
                    callback(obj);
                }else{
                    callback(undefined);
                }
            }
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
                var obj = {};
                for(var key in result[0]){
                    obj[key] = result[0][key];
                }
                if(Object.keys(obj).length>0){
                    callback(obj);
                }else{
                    callback(undefined);
                }
            }
        });
    });
};

module.exports = {createUser,findUserByNicknameAndPassword,findUserByNickname};
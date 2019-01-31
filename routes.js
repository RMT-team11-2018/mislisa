const user = require('./models/user');
const {temp} = require('./controller/temperature')
var sessionChecker = (req, res, next) => {
    if (!req.session.user || !req.cookies.user_sid) {
        res.render('index.hbs', {
            login: false
        });
    } else {
        next();
    }
};

module.exports = (app)=>{
    app.get('/', sessionChecker, (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            temp((t)=>{
                res.render('index.hbs',{
                    login:true,
                    temp:t
                });
            });
            
        }else{
            res.render('index.hbs',{
                login:false
            });
        }
    });
    
    app.get('/game', (req, res) => {
        if(req.session.user && req.cookies.user_sid) {
            res.render('game.hbs',{
                login:true,
                nickname:req.session.user.nadimak
            });
        }
        else{
            res.redirect('/');
        }
    });
    
    
    app.post('/profile', (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            var nadimak = req.body.nickname;
            user.findUserByNickname(nadimak, (user) => {
                if (!user) {
                    res.render('index.hbs', {
                        login: true,
                        searchMessage: `Ne postoji igrač sa nadimkom ${nadimak}`
                    });
                }
                else {
                    res.render('profile.hbs', {
                        name: user.nadimak
                    });
                }
            })
        }
    });
    
    app.get('/profile/:id', (req, res) => {
        //Kako ovo odraditi preko sessionChechera? Ne prikazuje mi brain.gif
        if (req.session.user && req.cookies.user_sid) {
            if (req.params.id == 'my') {
                res.render('profile.hbs', {
                    name: req.session.user.nadimak
                });
            }
        } else {
            res.redirect('/');
        }
    });
    
    app.get('/logout', (req, res) => {
        if (req.session.user && req.cookies.user_sid){
            req.session.destroy();
        }
        res.redirect('/');
    });
    
    app.get('/:trash', (req, res) => {
        res.redirect('/');
    });
    
    app.post('/registration', (req, res) => {
        var userObj = {
            nadimak: req.body.nickname,
            sifra: req.body.password,
            email: req.body.email,
            brojNivoa: 0
        };
        user.createUser(userObj, (user, err) => {
            if (err) {
                res.render('index.hbs', {
                    loginMessage: 'Nadimak je zauzet'
                });
            } else {
                req.session.user = user;
                res.redirect('/');
            }
        });
    });
    
    app.post('/login', (req, res) => {
        user.findUserByNicknameAndPassword(req.body.nickname, req.body.password, (user) => {
            if (user) {
                req.session.user = user;
                temp((t)=>{
                    res.render('index.hbs', {
                        login: true,
                        temp:t
                    });
                });
            } else {
                res.render('index.hbs', {
                    loginMessage: 'Pogrešan nadimak ili šifra'
                });
            }
        });
    });
}
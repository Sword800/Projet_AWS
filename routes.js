const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');


var knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: ".data/db.sqlite3"
    },
    useNullAsDefault: true,
    debug: true,
});

router.get('/', function(req, res){
  return res.redirect('/login');
});

router.get('/signup', function(req, res) {
  return res.render('views/signup.html', {error_signup: req.session.error_signup})
});

router.post('/signup', function(req, res) {
  knex('users').select().where('pseudo', req.body.pseudo).orWhere('email', req.body.email).then(function(rows){
    
      if(rows.length == 0)
      {
        knex('users').insert({pseudo: req.body.pseudo,password: req.body.password,email: req.body.email}).then(function(){
          
          req.session.error_signup = false;
          req.session.pseudo = req.body.pseudo;
          
          let token = uuidv4();
          
          knex('users').where('pseudo', req.body.pseudo).update({token: token}).then(() => {
            
            req.session.token = token ;
            return res.redirect('/menu');
          });
        });
      } 
     else
     {
        req.session.error_signup = true;
        return res.redirect('/signup');
      }
  })
  
});

router.get('/menu', function(req, res) {
  
  if(req.session.pseudo == null || req.session.token == null) 
  {
    return res.redirect('/')
  }
  
  knex('users').select('token').where('pseudo', req.session.pseudo).then((rows) => {
        // if the pseudo doesnt exist
        if(rows.length != 1)
        {
          return res.render("views/login.html")
        }
        // if the token is the wrong one
        if(rows[0].token != req.session.token)
        {
          return res.render("views/login.html")
        }
        // not sure why it's here, should be removed ?
        if(req.session.pseudo == undefined)
        {
          return res.render("views/login.html")
        }
        else
        {
          return res.render('views/index.html', {pseudo: req.session.pseudo});
        }
      });
});

router.get('/login', function(req, res) {
  return res.render('views/login.html', {error_login: req.session.error_login})
});

router.post('/login', function(req, res) {
  
  knex('users').select().where('pseudo', req.body.pseudo).where('password', req.body.password).then((rows) => {
    if(rows.length == 0)
    {
      req.session.error_login = true;
      //console.log(req.session)
      return res.redirect('/login');
    } 
    else 
    {
      req.session.error_login = false;
      req.session.pseudo = req.body.pseudo;
      
      let token = uuidv4();
      
      knex('users').where('pseudo', req.body.pseudo).update({token: token}).then(() => {
        
        req.session.token = token ;
        return res.redirect('/menu');
      })
    }
  })
});

router.get('/logout', function(req, res) {
  
  knex('users').where('pseudo', req.body.pseudo).where('token', req.body.token).update('token', null);
  
  req.session.pseudo = null;
  req.session.token = null;
  
  return res.redirect('/');
})

module.exports = router;
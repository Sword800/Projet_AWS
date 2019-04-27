const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const bodyP = require('body-parser');
const nunjucks = require('nunjucks');
const session = require('express-session');
const routes = require('./routes.js');
const io = require('socket.io')(http);
const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: ".data/db.sqlite3"
    },
    debug: true,
    useNullAsDefault: true
});
const sockets = require('./sockets.js')(io, knex);


app.use(session({
    secret: '12345',
    resave: false,
    saveUninitialized: false,
}));

function checkHttps(req, res, next){
  // protocol check, if http, redirect to https
  if(req.get('X-Forwarded-Proto').indexOf("https")!=-1){
    return next()
  } else {
    res.redirect('https://' + req.hostname + req.url);
  }
}

app.all('*', checkHttps)

var PATH_TO_TEMPLATES = '.' ;
nunjucks.configure( PATH_TO_TEMPLATES, {
    autoescape: true,
    express: app
} ) ;

app.use(express.static('public'))
   .use(bodyP.urlencoded({ extended: false }))
   .use('/', routes)
   .use('/login', routes)
   .use('/signup', routes)
   .use('/menu', routes)
   .use('/logout', routes)

http.listen(3000, function(){
  console.log('listening on *:3000');
});
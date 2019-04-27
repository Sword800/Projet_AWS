module.exports = function(io, knex) {
  let connected_users = {}
  
  function getKeyByPseudo(object, value) 
  {
    return Object.keys(object).find(key => object[key].pseudo === value);
  }
  
  function zeros(dimensions) 
  {
    var array = [];

    for (var i = 0; i < dimensions[0]; ++i) 
    {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }

    return array;
  }
  
  function startGame(id1, id2)
  {
    let board = {p1: id1,p2: id2,arr: zeros([120, 120])};
    board.arr[120, 60] = 1;
    board.arr[0, 60] = 2;
  }
  
  function game(board, id1, id2)
  {
    let movep1 = connected_users[id1].move;
    let movep2 = connected_users[id2].move;
  }
  
  function createGame(player1, player2)
  {
    let idPlayer1 = getKeyByPseudo(connected_users, player1);
    let idPlayer2 = getKeyByPseudo(connected_users, player2);
    
    console.log(connected_users);
    io.to(idPlayer1).emit('createGame');
    io.to(idPlayer2).emit('createGame');
    
    startGame(idPlayer1, idPlayer2);
   }
  
   io.on('connection', function(socket){
    console.log('a user connected');
    let handshakeData = socket.request;
    let pseudo = handshakeData._query['pseudo'];


    // if a user connects twice, we want to forget about the previous connection
    for (const [sock_id, dict_pseudo] of Object.entries(connected_users))
      if(dict_pseudo == pseudo)
        delete connected_users[sock_id];

    let win
    let lose


    knex('users').select()
                .where('pseudo', pseudo)
                .then((rows) => {
      win = rows[0].win
      lose = rows[0].lose
      connected_users[socket.id] = {'pseudo': pseudo, 'win': win, 'lose': lose, move: null}
    }).then(() => {
      io.sockets.emit('user_list', {'list': Object.values(connected_users)});
    })
    

    socket.on('keypress', function(event){
      console.log('event: ' + event.key)
      let idFrom = getKeyByPseudo(connected_users, event.from)
      connected_users[idFrom].move = event.key
    })

    socket.on('challenge', function(event){
      let idTo = getKeyByPseudo(connected_users, event.to)
      io.to(idTo).emit('challenge', {from: event.from});
    })
    socket.on('accepted', function(event){
      let idTo = getKeyByPseudo(connected_users, event.to)
      io.to(idTo).emit('accepted', {from: event.from});
      createGame(event.to, event.from)
    });
    socket.on('declined', function(event){
      console.log('declined again !')
      let idTo = getKeyByPseudo(connected_users, event.to)
      io.to(idTo).emit('declined', {from: event.from});
    });

    socket.on('disconnect', function(){
      delete connected_users[socket.id]
      io.sockets.emit('user_list', {'list': Object.values(connected_users)})
    });
  });
}
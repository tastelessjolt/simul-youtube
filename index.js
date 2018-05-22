const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 9399

app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))


var curr_position = 0.0;
var position_timestamp = new Date().getTime();
var state_timestamp = new Date().getTime();

var curr_state = 'pause';

io.on('connection', function (socket) {
  console.log('a user connected');
  nickname = socket.handshake.query.nickname;
  socket.broadcast.emit('user connect', nickname);
  socket.nickname = nickname;

  
  socket.emit('initstate', { state: curr_state});
  if (curr_state == 'pause') {
    socket.emit('position', {position: (curr_position + (state_timestamp - position_timestamp)/1000.0 )});
  }
  else {
    socket.emit('position', { position: (curr_position + (new Date().getTime() - position_timestamp)/1000.0) });
  }

  socket.on('disconnect', function () {
    this.broadcast.emit('user disconnect', this.nickname);
    console.log('user disconnected');
  });

  socket.on('position', function(msg) {
    // this.broadcast.emit('position', msg);
    io.emit('position', msg);
    curr_position = msg.position;
    position_timestamp = new Date().getTime();
    console.log("position: " + msg);
  });

  socket.on('state', function (msg) {
    // this.broadcast.emit('state', msg);
    io.emit('state', msg);
    curr_state = msg.state;
    state_timestamp = new Date().getTime();
    console.log("state: " + msg);
  });
});
  
http.listen(PORT, () => console.log(`Listening on ${ PORT }`))
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

  
io.on('connection', function (socket) {
  console.log('a user connected');
  nickname = socket.handshake.query.nickname;
  socket.broadcast.emit('user connect', nickname);
  socket.nickname = nickname;

  socket.on('disconnect', function () {
    this.broadcast.emit('user disconnect', this.nickname);
    console.log('user disconnected');
  });

  socket.on('position', function(msg) {
    // this.broadcast.emit('position', msg);
    io.emit('position', msg);
    console.log("position: " + msg);
  });

  socket.on('state', function (msg) {
    // this.broadcast.emit('state', msg);
    io.emit('state', msg);
    console.log("state: " + msg);
  });
});
  
http.listen(PORT, () => console.log(`Listening on ${ PORT }`))
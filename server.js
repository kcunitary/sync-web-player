const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})
io.on('connection', (socket) => {
  socket.on('room message', (roomname) => {
    socket.join(roomname)
    socket.on('name message', (msg) => {
      if (msg[0] === socket.id) {
        socket.id = msg[1]
        console.log(`用户${socket.id}加入房间${roomname}`)
        //向其他人广播当前加入用户身份
        io.to(roomname).emit('name message', socket.id)
      }
    })
    socket.on('disconnect', () => {
      io.to(roomname).emit('outroom', socket.id)
      console.log(`用户${socket.id}退出房间${roomname}`)
      socket.disconnect(false)
    })
    //随视频播放持续广播当前播放地址和播放位置
    socket.on('timeupdate', (msg) => {
      io.to(roomname).emit('connection', msg)
    })
    //广播视频地址
    socket.on('url message', (msg) => {
      io.to(roomname).emit('url message', msg)
    })
    //拖动进度同步
    socket.on('seeking', (msg) => {
      io.to(roomname).emit('seeking', msg)
    })
    //发送聊天消息
    socket.on('chat message', (msg) => {
      msg.push(socket.id)
      io.to(roomname).emit('chat message', msg)
    })
    socket.on('play', (msg) => {
      io.to(roomname).emit('play', msg);
    });
    //暂停
    socket.on('pause', (msg) => {
      io.to(roomname).emit('pause', msg)
    })
  })
})
server.listen(3000, () => {
  console.log('listening on *:3000')
})
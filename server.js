
const express = require('express')

const io = require('socket.io')
({
  path: '/webrtc'
})

const app = express()
const port = 8080

const rooms = {}
const messages = {}
const users = {}

app.use(express.static(__dirname + '/build'))
app.get('/*', (req, res, next) => {
  res.sendFile(__dirname + '/build/index.html')
})

// app.get('conference/:room', (req, res, next) => {
//   // res.sendFile(__dirname + '/build/index.html')
// })

const server = app.listen(port, () => {
  console.log('Сервер работает')
})

io.listen(server)

// io.on('connection', socket => {
//   console.log('connected')
// })

const peers = io.of('/webrtcPeer')


peers.on('connection', socket => {

  const room = socket.handshake.query.room

  rooms[room] = rooms[room] && rooms[room].set(socket.id, socket) || (new Map()).set(socket.id, socket)
  messages[room] = messages[room] || []
  users[room] = users[room] || []

  console.log(socket.id)
  socket.emit('connection-success', {
    success: socket.id,
    peerCount: rooms[room].size,
    messages: messages[room],
    users: users[room],
  })

  const broadcast = () => {
    const _connectedPeers = rooms[room]

    for (const [socketId, _socket] of _connectedPeers.entries()) {
      _socket.emit('joined-peers', {
        peerCount: rooms[room].size,
      })
    }
  }
  broadcast()

  const disconnectedPeer = (socketId) => {
    const _connectedPeers = rooms[room]
    for (const [_socketId, _socket] of _connectedPeers.entries()) {
      _socket.emit('peer-disconnected', {
        peerCount: rooms[room].size,
        socketId
      })
    }
  }

  socket.on('new-message', (data) => {
    console.log('new-message', JSON.parse(data.payload))
    messages[room] = [...messages[room], JSON.parse(data.payload)]
  })

  socket.on('new-users', (data) => {
    console.log('new-users', JSON.parse(data.payload))
    users[room] = [...users[room], JSON.parse(data.payload)]
    console.log(users[room])
    socket.emit('users', users[room])
  })

  socket.on('disconnect', () => {
    console.log('disconnected')
    rooms[room].delete(socket.id)
    messages[room] = rooms[room].size === 0 ? null : messages[room]
    users[room] = rooms[room].size === 0 ? null : messages[room]
    disconnectedPeer(socket.id)
  })

  socket.on('onlinePeers', (data) => {
    const _connectedPeers = rooms[room]
    for (const [socketId, _socket] of _connectedPeers.entries()) {
      if (socketId !== data.socketId.local) {
        console.log('online-peer', data.socketId, socketId)
        socket.emit('online-peer', socketId)
      }
    }
  })

  socket.on('offer', data => {
    const _connectedPeers = rooms[room]
    for (const [socketId, socket] of _connectedPeers.entries()) {
      if (socketId === data.socketId.remote) {
        socket.emit('offer', {
          sdp: data.payload,
          socketId: data.socketId.local
        }
        )
      }
    }
  })

  socket.on('answer', (data) => {
    const _connectedPeers = rooms[room]
    for (const [socketId, socket] of _connectedPeers.entries()) {
      if (socketId === data.socketId.remote) {
        console.log('Answer', socketId, data.socketId, data.payload.type)
        socket.emit('answer', {
          sdp: data.payload,
          socketId: data.socketId.local
        }
        )
      }
    }
  })

  socket.on('candidate', (data) => {
    const _connectedPeers = rooms[room]
    for (const [socketId, socket] of _connectedPeers.entries()) {
      if (socketId === data.socketId.remote) {
        socket.emit('candidate', {
          candidate: data.payload,
          socketId: data.socketId.local
        })
      }
    }
  })

})
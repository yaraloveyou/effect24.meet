import React, { Component } from 'react';
import Video from '../Components/Video'
import VideoField from '../Components/VideoField'
import Draggable from '../Components/Draggable'
import Chat from '../Components/Chat'
import jwt_decoded from 'jwt-decode'
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import { Form, ListGroup } from "react-bootstrap"
import io from 'socket.io-client'
import { Redirect } from 'react-router';

class Conference extends Component {
  constructor(props) {
    super(props)

    this.state = {
      //Video 
      localStream: null,
      remoteStream: null,
      onStream: false,
      lDisplay: false,
      history: null,
      //VideoField
      remoteStreams: [],
      peerConnections: {},
      selectedVideo: null,

      status: 'Loading...',

      config: {
        'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }, {
          'urls': 'turn:78.24.218.72:3478',
          'username': 'username1',
          'credential': 'password1'
        }]
      },
      sdpConstraints: {
        'mandatory': {
          'OfferToReceiveAudio': true,
          'OfferToReceiveVideo': true
        }
      },

      messages: [],
      sendChannels: [],
      disconnected: false,
      modalInvite: false,
      modalUsers: false,
      users: [],
      user: jwt_decoded(localStorage.getItem('token')),
    }

    this.serviceIP = '/webrtcPeer'
    this.socket = null
  }

  componentDidMount = () => {

    this.socket = io(
      this.serviceIP,
      {
        path: '/webrtc',
        query: {
          room: window.location.pathname
        }
      }
    )

    this.socket.on('online-peer', socketId => {
      this.createPeerConnection(socketId, pc => {
        if (pc) {
          const handleSendChannelStatusChange = (event) => {
            console.log('send channel status: ' + this.state.sendChannels[0].readyState)
          }

          const sendChannel = pc.createDataChannel('sendChannel')
          sendChannel.onopen = handleSendChannelStatusChange
          sendChannel.onclose = handleSendChannelStatusChange

          this.setState(state => {
            return {
              sendChannels: [...state.sendChannels, sendChannel]
            }
          })
          const handleReceiveMessage = (event) => {
            const message = JSON.parse(event.data)
            console.log(message)
            this.setState(state => {
              return {
                messages: [...state.messages, message]
              }
            })
          }

          const handleReceiveChannelStatusChange = (event) => {
            if (this.receiveChannel) {
              console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
            }
          }

          const receiveChannelCallback = (event) => {
            const receiveChannel = event.channel
            receiveChannel.onmessage = handleReceiveMessage
            receiveChannel.onopen = handleReceiveChannelStatusChange
            receiveChannel.onclose = handleReceiveChannelStatusChange
          }

          pc.ondatachannel = receiveChannelCallback
          pc.createOffer(this.state.sdpConstraints)
            .then(sdp => {
              pc.setLocalDescription(sdp)

              this.sendToPeer('offer', sdp, {
                local: this.socket.id,
                remote: socketId
              })
            })
        }
      })
    })

    this.socket.on('joined-peers', data => {
      this.setState({
        status: data.peerCount > 1 ? `${data.peerCount} подключено` : `Никого нет`
      })
    })

    this.socket.on('users', data => {
      console.log(data)
      this.setState(state => {
        return {
          users: data
        }
      })
    })

    this.socket.on('connection-success', data => {
      this.getLocalStream()
      this.sendToPeer('new-users', JSON.stringify(this.state.user.username), { local: this.socket.id })
      const status = data.peerCount > 1 ? `${data.peerCount} подключено` : `Никого нет`
      this.setState({
        status: status,
        messages: data.messages,
        users: data.users
      })
    })

    this.socket.on('offer', data => {
      this.createPeerConnection(data.socketId, pc => {
        pc.addStream(this.state.localStream)

        const handleSendChannelStatusChange = (event) => {
          console.log('send channel status: ' + this.state.sendChannels[0].readyState)
        }

        const sendChannel = pc.createDataChannel('sendChannel')
        sendChannel.onopen = handleSendChannelStatusChange
        sendChannel.onclose = handleSendChannelStatusChange

        this.setState(state => {
          return {
            sendChannels: [...state.sendChannels, sendChannel]
          }
        })
        const handleReceiveMessage = (event) => {
          const message = JSON.parse(event.data)
          console.log(message)
          this.setState(state => {
            return {
              messages: [...state.messages, message]
            }
          })
        }

        const handleReceiveChannelStatusChange = (event) => {
          if (this.receiveChannel) {
            console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
          }
        }

        const receiveChannelCallback = (event) => {
          const receiveChannel = event.channel
          receiveChannel.onmessage = handleReceiveMessage
          receiveChannel.onopen = handleReceiveChannelStatusChange
          receiveChannel.onclose = handleReceiveChannelStatusChange
        }

        pc.ondatachannel = receiveChannelCallback

        pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
          pc.createAnswer(this.state.sdpConstraints)
            .then(sdp => {
              pc.setLocalDescription(sdp)

              this.sendToPeer('answer', sdp, {
                local: this.socket.id,
                remote: data.socketId
              })
            })
        })
      })
    })

    this.socket.on('peer-disconnected', data => {
      const remoteStreams = this.state.remoteStreams.filter(stream =>
        stream.id !== data.socketId
      )

      this.setState(state => {
        try {
          const selectedVideo = state.selectedVideo.id === data.socketId && remoteStreams.length ? { selectedVideo: remoteStreams[0] } : null
          return {
            remoteStreams,
            ...selectedVideo,
            status: data.peerCount > 1 ? `${data.peerCount} подключено` : `Никого нет`
          }
        } catch { }

      })
    })

    this.socket.on('answer', data => {
      const pc = this.state.peerConnections[data.socketId]
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
    })

    this.socket.on('candidate', (data) => {
      const pc = this.state.peerConnections[data.socketId]
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate))
      }
    })
  }

  createPeerConnection = (socketId, callback) => {
    try {
      let pc = new RTCPeerConnection(this.state.config)
      const peerConnections = { ...this.state.peerConnections, [socketId]: pc }
      this.setState({
        peerConnections
      })

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendToPeer('candidate', event.candidate, {
            local: this.socket.id,
            remote: socketId
          })
        }
      }

      pc.ontrack = (event) => {

        let _remoteStream = null
        let remoteStreams = this.state.remoteStreams
        let remoteVideo = {}

        const allVideos = this.state.remoteStreams.filter(stream => stream.id === socketId)

        if (allVideos.length) {
          _remoteStream = allVideos[0].stream
          _remoteStream.addTrack(event.track, _remoteStream)
          remoteVideo = {
            ...allVideos[0],
            stream: _remoteStream,
            username: this.state.user.username
          }

          remoteStreams = this.state.remoteStreams.map(_remoteVideo => {
            return _remoteVideo.id === remoteVideo.id && remoteVideo || _remoteVideo
          })
        } else {
          _remoteStream = new MediaStream()
          _remoteStream.addTrack(event.track, _remoteStream)

          remoteVideo = {
            id: socketId,
            name: socketId,
            stream: _remoteStream,
            username: this.state.user.username
          }

          remoteStreams = [...this.state.remoteStreams, remoteVideo]
        }

        this.setState((state) => {
          const remoteStream = state.remoteStreams.length > 0 ? {} : { remoteStream: _remoteStream }
          let selectedVideo = state.remoteStreams.filter(stream => stream.id === state.selectedVideo.id)
          selectedVideo = selectedVideo.length ? {} : { selectedVideo: remoteVideo }
          return {
            ...selectedVideo,
            ...remoteStream,
            remoteStreams,
          }
        })
      }

      pc.close = () => {

      }

      if (this.state.localStream) {
        this.state.localStream.getTracks().forEach(track => {
          pc.addTrack(track, this.state.localStream)
        })
      }

      callback(pc)

    } catch (err) {
      console.log('pc not created', err)
      callback(null)
    }
  }

  getLocalStream = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.setState({
          localStream: stream,
        })
        this.onlineUsers()
        this.state.lDisplay = false
        this.state.onStream = true
      })
      .catch((err) => {
        console.log('getUserMedia Error: ', err)
        this.setState({
          localStream: new MediaStream()
        })
        this.onlineUsers()
        this.state.onStream = false
      })
  }

  onlineUsers = () => {
    this.sendToPeer('onlinePeers', 'null', { local: this.socket.id })
  }

  sendToPeer = (type, payload, socketId) => {
    this.socket.emit(type, {
      socketId,
      payload
    })
  }

  switchVideo = (_video) => {
    this.setState({
      selectedVideo: _video
    })
  }

  render() {
    if (this.state.disconnected) {
      try {
        this.socket.close()
        this.socket.localStream.getTracks().forEach(track => track.stop())
      } catch {
      } finally {
        return <Redirect to='/home'></Redirect>
      }
    }
    const statusText = <div style={{ color: 'white', padding: 5, }}>{this.state.status}</div>
    return (
      <div style={{
        backgroundColor: '#202020',
        minWidth: '100%',
        minHeight: '100%'
      }}>
        <Modal show={this.state.modalInvite} onHide={this.state.modalInvite} animation={false}>
          <Modal.Header closeButton>
            <Modal.Title>Ссылка на вашу конференцию</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form style={{
              width: 450
            }} className="d-flex flex-column">
              <Form.Control
                className="mt-3"
                value={window.location.href}
                readOnly
              />
              <Button className="mt-2" variant="outline-success" onClick={(e) => {
                this.setState({ modalInvite: false })
              }}>
                Закрыть
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
        {this.state.onStream ? <Draggable style={{
          zIndex: 1000,
          position: 'absolute',
          right: '20%',
          bottom: 0,
          cursor: 'move'
        }}>
          <Video
            videoStyle={{
              width: 200,
              height: 200,
            }}
            frameStyle={{
              width: 200,
              margin: 5,
              borderRadius: 5,
              backgroundColor: '#202020',
            }}
            // ref={this.localVideoref}
            videoStream={this.state.localStream}
            autoPlay muted
            showMuteControls={true}>
          </Video>
        </Draggable> : <div></div>}

        <div>
          <VideoField
            switchVideo={this.switchVideo}
            remoteStreams={this.state.remoteStreams}
          ></VideoField>
        </div>
        <Video
          videoStyle={{
            zIndex: 1,
            position: 'fixed',
            marginLeft: 'auto',
            marginRight: 'auto',
            bottom: 0,
            top: '10%',
            minWidth: '80%',
            maxHeight: '90%',
            backgroundColor: '#202020'
          }}
          frameStyle={{
            backgroundColor: '#202020',
            minWidth: '80%',
            minHeight: '90%',
          }}
          // ref={ this.remoteVideoref }
          videoStream={this.state.selectedVideo && this.state.selectedVideo.stream}
          autoPlay>
        </Video>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            padding: '10px',
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: '80px',
            transition: 'all 0.3s ease-in-out',
            margin: '5px',
            backgroundColor: 'rgb(233, 229, 229)',
            maxHeight: '10%',
            maxWidth: '80%',
            bottom: '0',
            right: '10px',
            left: '0px',
            whiteSpace: 'nowrap',
            position: 'absolute',
            zIndex: '5',
          }}
        >
          <div style={{
            zIndex: 3,
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: 'flex',
            margin: 'auto',
          }}>
            <i onClick={(e) => {
              this.setState({ modalInvite: true })
            }}
              style={{ cursor: 'pointer', marginTop: 15, color: '#696969' }} className='material-icons'>add</i>
            <i onClick={(e) => {
              this.setState({ disconnected: true })
            }}
              style={{ cursor: 'pointer', marginTop: 15, color: 'red' }} className='material-icons'>call_end</i>
            <div style={{
              margin: 5,
              background: '#696969',
              padding: 5,
              borderRadius: 2,
              right: 0,
            }}>
              {statusText} </div>
          </div>
        </div>
        <Chat
          user={{ username: this.state.user.username, uid: this.socket && this.socket.id || '' }}
          messages={this.state.messages}
          sendMessage={(message) => {
            this.setState(state => {
              return {
                messages: [...state.messages, message]
              }
            })
            this.state.sendChannels.map(sendChannel => {
              sendChannel.readyState === 'open' && sendChannel.send(JSON.stringify(message))
            })
            this.sendToPeer('new-message', JSON.stringify(message), { local: this.socket.id })
          }} />
      </div >
    )
  }
}

export default Conference;

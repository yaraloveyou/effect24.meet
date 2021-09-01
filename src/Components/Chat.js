import React, { useState, useEffect, useRef } from 'react'
import DragDrop from './DragDrop'

const Chat = props => {
  const [message, setMessage] = useState('')
  const [user, setUser] = useState({ uid: 0, })
  const [imageZoom, setImageZoom] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')

  const scrollToBottom = () => {
    const chat = document.getElementById("chatList");
    chat.scrollTop = chat.scrollHeight
  }

  useEffect(() => {
    scrollToBottom()
    setUser({ username: props.user.username, uid: props.user.uid, })
  }, [props])

  const sendMessage = (msg) => {
    props.sendMessage(msg);
    scrollToBottom()
  }

  const handleSubmit = event => {
    if (message === '') return
    event.preventDefault();
    sendMessage({ type: 'text', message: { username: user.username, id: user.uid, sender: { uid: user.uid, }, data: { text: message } } })
    setMessage('')
  };

  const handleChange = event => {
    setMessage(event.target.value)
  }

  const renderMessage = (userType, data) => {
    const message = data.message

    const msgDiv = data.type === 'text' && (
      <div className="msg">
        <p>{message.username}</p>
        <div className="message"> {message.data.text}</div>
      </div>
    ) || (
        <div className="msg">
          <p>{message.username}</p>
          <img
            onClick={() => {
              setImageZoom(true)
              setSelectedImage(message.data)
            }}
            className="message"
            style={{
              width: 200,
              // height: 100
              cursor: 'pointer',
            }}
            src={message.data} />
        </div>
      )

    return (<li className={userType} >{msgDiv}</li>)

  }

  const showEnlargedImage = (data) => {
    return (<img
      src={data}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        position: 'relative',
        zIndex: 100,
        display: 'block',
        width: 450,
        cursor: 'pointer',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 20,
        borderRadius: 10,
      }}
      onClick={() => setImageZoom(false)}
    />)
  }

  return (
    <div>
      {imageZoom && showEnlargedImage(selectedImage)}

      <div className="chatWindow" style={{
        zIndex: 10,
        position: 'fixed',
        top: 0,
        bottom: 0,
        right: 0,
        minWidth: '20%',
      }}>
        <ul className="chat" id="chatList">
          {props.messages ? props.messages.map(data => (
            <div key={data.id}>
              {user.username === data.message.username ? renderMessage('self', data) : (renderMessage('other', data))}
            </div>
          )) : ""}
        </ul>
        <DragDrop
          className="chatInputWrapper"
          sendFiles={(files) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              const maximumMessageSize = 262118
              if (e.target.result.length <= maximumMessageSize)
                sendMessage({ type: 'image', message: { username: user.username, id: user.uid, sender: { uid: user.uid, }, data: e.target.result } })
              else
                alert('Размер картинки слишком большкой')
            }

            reader.readAsDataURL(files[0])
          }}
        >
          <div>
            <form onSubmit={handleSubmit}>
              <input
                className="textarea input"
                type="text"
                maxlength="27"
                placeholder="Введите сообщение..."
                onChange={handleChange}
                value={message}
              />
            </form>
          </div>
        </DragDrop>
      </div>
    </div>
  )
}

export default Chat
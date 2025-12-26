import { useState } from 'react';
import { io } from 'socket.io-client'

export default function Socket() {

  const [newMessage, setnewMessage] = useState('');

  const [messages, setMessages] = useState([]);

//socket client instance connects to server
  const socket = new io('http://localhost:3000');


//establishing socket connection
  socket.on('connection', () => {
    console.log("Connected to server")
  })

//handler to send message
  const sendeMessage = () => {
    socket.emit('message', newMessage)
  }

//listenign for new-message from server

  socket.on('new-message', (payload) => {
    setMessages([...messages, payload])

  })
  return (
    <div className='w-full bg-white p-5'>

{/*type and send messages */}
      <div>
        <input onChange={(e) => setnewMessage(e.target.value)} className='border-2 border-black' placeholder='Enter new message'></input>
        <button className='bg-black text-white' onClick={sendeMessage}>Send</button>
      </div>

{/*Showing all messages */}
      {
        messages.map((message, index) => {
          return <div key={index}>{message}</div>
        })
      }
    </div>
  )
}

import React, { useState, useEffect} from 'react'
import  { useParams } from 'react-router-dom'

function Room(props) {
//   const roomCode = useState(props.match.params)
  const roomCode = useParams().roomCode;
  
  const initialState = {
    votes_to_skip: 2,
    guest_can_pause: false,
    is_host: false
  }

  const [roomData, setRoomData] = useState(initialState)

   useEffect(() => {
    fetch("/api/get_room" + "?code=" + roomCode)
      .then(res => res.json())
      .then(data => {
        setRoomData({
          ...roomData, 
          votes_to_skip: data.votes_to_skip,
          guest_can_pause: data.guest_can_pause,
          is_host: data.is_host,
        })
      })
  },[roomCode,setRoomData]) //It renders when the object changes .If we use roomData and/or roomCode then it rerenders infinite times

  return (
    <div>
      <h3>{roomCode}</h3>
      <p>Votes: {roomData.votes_to_skip}</p>  
      <p>Guests can pause: {roomData.guest_can_pause.toString()}</p>
      <p>Host: {roomData.is_host.toString()}</p>  
    </div>
  )
}

export default Room
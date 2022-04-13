import React, { useState, useEffect} from 'react'
import { Grid, Typography, Button} from '@material-ui/core';
import  { useParams, useNavigate } from 'react-router-dom'
import AddButton from './LeaveRoomButton';
// import LeaveRoom from './LeaveRoomCallBack';


function Room() {
  let roomCode = useParams().roomCode;
  const initialState = {
    votes_to_skip: 2,
    guest_can_pause: false,
    is_host: false
  }

  let leaveRoom = LeaveRoom;
  
  const [roomData, setRoomData] = useState(initialState)
  let navigate = useNavigate();
  useEffect(() => {
    fetch("/api/get_room" + "?code=" + roomCode)
      .then(response => {
        if (!response.ok) {
          navigate('/');
        }
        return response.json();
      })

      .then(data => {
        setRoomData({
          ...roomData, 
          votes_to_skip: data.votes_to_skip,
          guest_can_pause: data.guest_can_pause,
          is_host: data.is_host,
        })
      })
  },[roomCode,setRoomData])
  
  return (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h4">
          Código: {roomCode}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography component="h6" variant="h6">
          Votos: {roomData.votes_to_skip.toString()}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography component="h6" variant="h6">
          Pode pausar: {roomData.guest_can_pause.toString()}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography component="h6" variant="h6">
          Anfitrião: {roomData.is_host.toString()}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <AddButton/ >
      </Grid>
    </Grid>
  )
}

export default Room
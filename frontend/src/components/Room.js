import React, { useState, useEffect} from 'react'
import { Grid, Typography, Button} from '@material-ui/core';
import  { useParams, useNavigate } from 'react-router-dom'
import LeaveButton from './LeaveRoomButton';
import UpdateRoomPage from './UpdateRoomPage';
import MusicPLayer from './MusicPlayer';


function Room() {
  let roomCode = useParams().roomCode;
  const initialState = {
    votes_to_skip: 2,
    guest_can_pause: false,
    is_host: false,
    show_settings: false,
    spotify_authenticated: null,
    song: {}
  }
  
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
        return data;
      })
      .then((data) => {
        if (data.is_host) {
          authenticateSpotify();
        }
      })
  },[roomCode,setRoomData])

  
  useEffect(() => {
    const interval = setInterval(() => {
      if (roomData.spotify_authenticated === null) {
        return;
      }
      else{
        console.log('oi')
        getCurrentSong();
      }  
    }, 1000);
    return () => clearInterval(interval);

  },[roomData])


  let authenticateSpotify = () => {
    fetch('/spotify/is_authenticated')
      .then((response) => response.json())
      .then(data => {
        setRoomData({
          ...roomData,
          spotify_authenticated: data.is_authenticated,
        })
        if (!data.is_authenticated) {
          fetch('/spotify/get_auth_url')
            .then((response) => response.json())
            .then(data => {
              window.location.replace(data.url);
            })
        }
      })
  }

  let getCurrentSong = () => {
    fetch('/spotify/current_song').then((response) => {
      if (!response.ok) {
        return {};
      }
      else{
        return response.json();
      }
    }).then((data => {
      setRoomData({
        ...roomData,
        song: data,
      })
    })
  )} 

  let updateShowSettings = (value, reload) => {
    setRoomData({
      ...roomData,
      show_settings: value,
    })
    if (reload){
      window.location.reload();
    }
  }


  let renderSettings = () => {
    return(
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <UpdateRoomPage
            update={true}
            votes_to_skip={roomData.votes_to_skip}
            guest_can_pause={roomData.guest_can_pause}
            roomCode={roomCode}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button variant="contained" color="secondary" onClick={() => updateShowSettings(false, true)}>
            Fechar
          </Button>
        </Grid>
      </Grid>
    )
  }


  let renderSettingsButton = () => {
    return(
      <Grid item xs={12} align="center">
        <Button variant="contained" color="primary" onClick={() => updateShowSettings(true, false)}>
          Configrurações
        </Button>
      </Grid>
    )
  }

  if (roomData.show_settings) {
    return renderSettings();
  }
  return (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h4">
          Código: {roomCode}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
      <MusicPLayer {...roomData.song}/>
      </Grid>
      {roomData.is_host ? renderSettingsButton() : null}
      <Grid item xs={12} align="center">
        <LeaveButton />
      </Grid>
    </Grid>
  )
}

export default Room
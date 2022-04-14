import React, { Component, useState, useEffect} from 'react';
import Room from './Room';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ButtonGroup, Button, Grid, Typography } from '@material-ui/core';
import { Navigate } from 'react-router-dom';

function HomePage () {
    const initialState = {
      roomCode: null
    }
    
    const [roomData, setRoomData] = useState(initialState)
    useEffect(() => {
        fetch('/api/user_in_room')
        .then(response => response.json())
        .then(data => {
            setRoomData({
                ...roomData,
                roomCode: data.code,
            })
        })
    },[setRoomData])


    let renderHomePage = () => {
        return (
            <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} align="center">
                    <Typography component="h3" variant="h3">
                        Playlist do rolê
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button component={Link} to="/join" color="primary">
                            Entrar numa sala
                        </Button>
                        <Button component={Link} to="/create" color="secondary">
                            Criar uma sala
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        );
    }


    return (
        roomData.roomCode ? (
            <Navigate replace to={"/room/"+roomData.roomCode} />
        ) : renderHomePage()
    );
}

export default HomePage;
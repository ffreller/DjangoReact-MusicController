import React, { Component } from 'react';
import RoomJoinPage from './RoomJoinPage';
import CreateRoomPage from './CreateRoomPage';
import Room from './Room';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ButtonGroup, Button, Grid, Typography } from '@material-ui/core';
import { Navigate } from 'react-router-dom';

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: null
        };
    }

    async componentDidMount() {
        fetch('/api/user_in_room')
        .then((response) => response.json())
        .then((data) => {
            this.setState({
                roomCode: data.code,
            });
        });
    }

    renderHomePage() {
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

    clearRoomCode(){
        this.setState({
            roomCode: null,
        });
    }


    render() {
        return (
            <div>
                <Router>
                    <Routes>
                        <Route
                            exact
                            path="/"
                            element={
                                this.state.roomCode ? (
                                    <Navigate replace to={"/room/"+this.state.roomCode} />
                                ) : this.renderHomePage()
                            }
                        />
                        <Route exact path="/join" element={<RoomJoinPage />} />
                        <Route exact path="/create" element={<CreateRoomPage />} />
                        <Route path="/room/:roomCode" element={<Room />} />
                    </Routes>
                </Router>
            </div>
        );
    }
}